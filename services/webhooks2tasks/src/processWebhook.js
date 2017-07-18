// @flow

import { logger } from '@amazeeio/amazeeio-local-logging';

import { getSiteGroupsByGitUrl } from '@amazeeio/amazeeio-api';
import { SiteGroupNotFound } from '@amazeeio/amazeeio-logs';
import { sendToAmazeeioLogs } from '@amazeeio/amazeeio-logs';
import githubPullRequestClosed from './handlers/githubPullRequestClosed';
import githubBranchDeleted from './handlers/githubBranchDeleted';
import githubPush from './handlers/githubPush';

import type { WebhookRequestData, ChannelWrapper, RabbitMQMsg, SiteGroup } from './types';


export default async function processWebhook (rabbitMsg: RabbitMQMsg, channelWrapper: ChannelWrapper): Promise<void> {

  const webhook: WebhookRequestData = JSON.parse(rabbitMsg.content.toString())

  let siteGroups: SiteGroup[]

  const {
    webhooktype,
    event,
    giturl,
    uuid,
    body,
  } = webhook;

  try {
    siteGroups = await getSiteGroupsByGitUrl(giturl)
  }
  catch (error) {
    if (error.name == 'SiteGroupNotFound') {
      const meta = {
        event: `${webhooktype}:${event}`
      }
      sendToAmazeeioLogs('warn', 'unresolved', uuid, `unresolvedSitegroup:webhooks2tasks`, meta,
        `Unresolved sitegroup \`${giturl}\` while handling ${webhooktype}:${event}`
      )
      channelWrapper.ack(rabbitMsg)
    } else {
      // we have an error that we don't know about, let's retry this message a little later

			const retryCount = rabbitMsg.properties.headers["x-retry"] ? (rabbitMsg.properties.headers["x-retry"] + 1) : 1

			if (retryCount > 3) {
        sendToAmazeeioLogs('error', '', uuid, "webhooks2tasks:resolveSitegroup:fail", {error: error, msg: JSON.parse(rabbitMsg.content.toString()), retryCount: retryCount}, `Error during loading sitegroup for GitURL '${giturl}', bailing after 3 retries, error was: ${error}`)
				channelWrapper.ack(rabbitMsg)
				return
			}

			const retryDelaySecs = Math.pow(10, retryCount);
			const retryDelayMilisecs = retryDelaySecs * 1000;

      sendToAmazeeioLogs('warn', '', uuid, "webhooks2tasks:resolveSitegroup:retry", {error: error, msg: JSON.parse(rabbitMsg.content.toString()), retryCount: retryCount}, `Error during loading sitegroup for GitURL '${giturl}', will try again in ${retryDelaySecs} secs, error was: ${error}`)

			// copying options from the original message
			const retryMsgOptions = {
				appId: rabbitMsg.properties.appId,
				timestamp: rabbitMsg.properties.timestamp,
				contentType: rabbitMsg.properties.contentType,
				deliveryMode: rabbitMsg.properties.deliveryMode,
				headers: { ...rabbitMsg.properties.headers, 'x-delay': retryDelayMilisecs, 'x-retry' : retryCount},
				persistent: true,
			};
			// publishing a new message with the same content as the original message but into the `amazeeio-tasks-delay` exchange,
			// which will send the message into the original exchange `amazeeio-tasks` after x-delay time.
			channelWrapper.publish(`amazeeio-webhooks-delay`, rabbitMsg.fields.routingKey, rabbitMsg.content, retryMsgOptions)

			// acknologing the existing message, we cloned it and is not necessary anymore
			channelWrapper.ack(rabbitMsg)
    }
    return
  }

  siteGroups.forEach(async (siteGroup) => {

    switch (`${webhooktype}:${event}`) {
      case "github:pull_request":

        switch (body.action) {
          case 'closed':
            await handle(githubPullRequestClosed, webhook, siteGroup, `${webhooktype}:${event}:${body.action}`)
            break;

          default:
            unhandled(webhook, siteGroup, `${webhooktype}:${event}:${body.action}`)
            break;
        }
        break;

      case "github:delete":
        switch (body.ref_type) {
          case "branch":
            // We do not handle branch deletes via github delete push event, as github also sends a regular push event with 'deleted=true'. It's handled there (see below inside "github:push")
            unhandled(webhook, siteGroup, `${webhooktype}:${event}:${body.ref_type}`)
            break;

          default:
            unhandled(webhook, siteGroup, `${webhooktype}:${event}:${body.ref_type}`)
            break;
        }
        break;

      case "github:push":
        if (body.deleted === true) {
          await handle(githubBranchDeleted, webhook, siteGroup, `${webhooktype}:${event}`)
        } else {
          await handle(githubPush, webhook, siteGroup, `${webhooktype}:${event}`)
        }

        break;

      default:
        unhandled(webhook, siteGroup, `${webhooktype}:${event}`)
        break;
    }

  });
  channelWrapper.ack(rabbitMsg)
}

async function handle(handler, webhook: WebhookRequestData, siteGroup: SiteGroup, fullEvent: string){
  const {
    webhooktype,
    event,
    giturl,
    uuid,
    body,
  } = webhook;

  logger.info(`Handling ${fullEvent} for sitegroup ${siteGroup.siteGroupName} `, { uuid, giturl });

  try {
    await handler(webhook, siteGroup)
  } catch(error) {
    logger.error(`Error handling ${fullEvent} for sitegroup ${siteGroup.siteGroupName}, error: ${error}`);
  }
}


async function unhandled(webhook: WebhookRequestData, siteGroup: SiteGroup, fullEvent: string) {
  const {
    webhooktype,
    event,
    giturl,
    uuid,
    body,
  } = webhook;

  const meta = {
    fullEvent: fullEvent
  }
  sendToAmazeeioLogs('info', siteGroup.siteGroupName, uuid, `unhandledWebhook`, meta,
    `Unhandled Webhook \`${fullEvent}\` for \`${siteGroup.siteGroupName}\``
  )
  return
}