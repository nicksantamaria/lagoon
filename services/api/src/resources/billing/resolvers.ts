import * as R from 'ramda';

import convertDateToMYSQLDateTimeFormat from '../../util/convertDateToMYSQLDateTimeFormat';
import billingModel, {
  AddBillingModifierInput,
  BillingModifier,
  BillingModifiersInput,
  UpdateBillingModifierInput,
  DeleteBillingModifierInput,
  DeleteAllBillingGroupModifiersInput
} from '../../models/billing';
import { BillingGroup } from '../../models/group';



/**
 * Create/Add Billing Modifier
 *
 * @param {obj} root The rootValue passed from the Apollo server configuration.
 * @param {AddBillingModifierInput} args
 * @param {ExpressContext} context this includes the context passed from the apolloServer query
 *     { sqlClient, hasPermissions, keycloakGrant, requestCache }
 *
 * @return {BillingModifier} The created modifier
 */
type AddBillingModifierAlias = (
  root: any,
  args: AddBillingModifierInput,
  context: { models: any; hasPermission: any }
) => Promise<BillingModifier>;
export const addBillingModifier: AddBillingModifierAlias = async (
  root,
  args,
  context
) => {
  const { models, hasPermission } = context;
  const { input } = args;

  // Input Validation
  if (R.isEmpty(input.group)) {
    throw new Error('You must provide a billing group name or id');
  }

  if (R.isEmpty(R.omit(['group', 'startDate', 'endDate'], input))) {
    throw new Error('You must provide a discount value or extra cost.');
  }

  if (new Date(input.startDate) >= new Date(input.endDate)) {
    throw new Error('You must provide a start date before the end date.');
  }

  // Permissions
  await hasPermission('group', 'add');

  const { group: groupInput, ...rest } = input;

  const group = await models.GroupModel.loadGroupByIdOrName(groupInput)

  const startDate = convertDateToMYSQLDateTimeFormat(rest.startDate);
  const endDate = convertDateToMYSQLDateTimeFormat(rest.endDate);

  const billingModifier =  { ...rest, group_id: group.id, startDate, endDate }

  // Action
  return billingModel.addBillingModifier(group, billingModifier);
};

/**
 * Update Billing Modifier
 *
 * @param {obj} root The rootValue passed from the Apollo server configuration.
 * @param {UpdateBillingModifierInput} args
 * @param {ExpressContext} context this includes the context passed from the apolloServer query
 *     { sqlClient, hasPermissions, keycloakGrant, requestCache }
 *
 * @return {String} Success
 */
export const updateBillingModifier = async (
  _,
  args: UpdateBillingModifierInput,
  context: { models: any; hasPermission: any }
) => {
  const { hasPermission, models } = context;
  const { input, input: { id, patch, patch: { group: groupInput, ...rest  }} } = args;

  if (R.isEmpty(input.patch)) {
    throw new Error('You must provide patch');
  }

  // Permissions
  await hasPermission('group', 'update');

  const isGroupInputExists = typeof input != 'undefined' && input.patch && groupInput && (groupInput.id || groupInput.name);
  const group: BillingGroup | {} = isGroupInputExists
    ? (await models.GroupModel.loadGroupByIdOrName(groupInput))
    : {};
  const group_id = isGroupInputExists ? { group_id: (group as BillingGroup).id } : {};

  const startDate =
    typeof input != 'undefined' && patch.startDate
      ? { startDate: convertDateToMYSQLDateTimeFormat(patch.startDate) }
      : {};
  const endDate =
    typeof input != 'undefined' && patch.endDate
      ? { endDate: convertDateToMYSQLDateTimeFormat(patch.endDate) }
      : {};

  const billingModifier =  { ...rest, ...group_id, ...startDate, ...endDate };
  const result = await billingModel.updateBillingModifier(id, billingModifier, group);

  console.log(result);
  return result;
};

/**
 * Delete Billing Modifier
 *
 * @param {obj} root The rootValue passed from the Apollo server configuration.
 * @param {DeleteBillingModifierInput} args
 * @param {ExpressContext} context this includes the context passed from the apolloServer query
 *     { sqlClient, hasPermissions, keycloakGrant, requestCache }
 *
 * @return {String} Success
 */
export const deleteBillingModifier = async (
  _,
  args: DeleteBillingModifierInput,
  context: { models: any; hasPermission: any }
) => {
  const { hasPermission } = context;
  const {
    input: { id }
  } = args;

  // Permissions
  await hasPermission('group', 'delete');

  // Action
  return billingModel.deleteBillingModifier(id);
};

/**
 * Delete All Billing Modifiers for a given Billing Gropu
 *
 * @param {obj} root The rootValue passed from the Apollo server configuration.
 * @param {DeleteAllBillingGroupModifiersInput} args
 * @param {ExpressContext} context this includes the context passed from the apolloServer query
 *     { sqlClient, hasPermissions, keycloakGrant, requestCache }
 *
 * @return {String} Success
 */
export const deleteAllBillingModifiersByBillingGroup = async (
  _,
  args: DeleteAllBillingGroupModifiersInput,
  context: { models: any; hasPermission: any }
) => {
  const { hasPermission } = context;
  const { input } = args;

  // Permissions
  await hasPermission('group', 'delete');

  // Action
  return billingModel.deleteAllBillingGroupModifiers(input);
};

/**
 * Get All Billing Modifiers Added to a Billing Group
 *
 * @param {obj} root The rootValue passed from the Apollo server configuration.
 * @param {BillingModifiersInput} args
 * @param {ExpressContext} context this includes the context passed from the apolloServer query
 *     { sqlClient, hasPermissions, keycloakGrant, requestCache }
 *
 * @return {[BillingModifier]} All modifiers associated to the billing Group
 */
export const getBillingModifiers = async (
  _,
  args: BillingModifiersInput,
  context: { models: any; hasPermission: any }
) => {
  const { hasPermission } = context;
  const { input: groupInput, month } = args;

  // Permissions
  await hasPermission('group', 'view');

  // Action
  return billingModel.getBillingModifiers(groupInput, month);
};

export const getAllModifiersByGroupId = async (root, input, context) =>
  getBillingModifiers(root, { input: { id: root.id } }, { ...context });
