import React from 'react';
import * as R from 'ramda';
import Head from 'next/head';
import { Query } from 'react-apollo';
import MainLayout from '../../layouts/MainLayout';
import AllBillingGroupsQuery from '../../lib/query/AllBillingGroups';
import BillingGroups from '../../components/BillingGroups';

import withQueryLoading from '../../lib/withQueryLoading';
import withQueryError from '../../lib/withQueryError';

import { bp, color } from '../../lib/variables';

/**
 * Displays the backups page, given the name of an openshift project.
 */
export const PageAdmin = () => (
  <>
    <Head>
      <title>{` Admin | Billing Groups`}</title>
    </Head>
    <Query query={AllBillingGroupsQuery} >
    {R.compose(
        withQueryLoading,
        withQueryError
      )(({ data: { allGroups: billingGroups} }) => {
        return(
          <MainLayout>
            <div className="content-wrapper">
              <div className="content">
                <BillingGroups billingGroups={billingGroups} />
              </div>
            </div>
            <style jsx>{`
              .content-wrapper {
                @media ${bp.tabletUp} {
                  display: flex;
                  padding: 0;
                }
              }

              .content {
                padding: 32px calc((100vw / 16) * 1);
                width: 100%;
              }

              .notification {
                background-color: ${color.lightBlue};
                color: ${color.white};
                padding: 10px 20px;
              }
            `}</style>
          </MainLayout>
          )})}
    </Query>
  </>
);

export default PageAdmin;
