import moment from 'moment';
import R from 'ramda';
import { Group, BillingGroup } from './group';
import { getKeycloakAdminClient } from '../clients/keycloak-admin';
import { getSqlClient, USE_SINGLETON } from '../clients/sqlClient';
import { query } from '../util/db';
import convertDateToMYSQLDateTimeFormat from '../util/convertDateToMYSQLDateTimeFormat'
import Sql from '../resources/billing/sql';


import { GroupInput } from './group';

export interface BillingModifier {
  id?: number;
  group?: Group | GroupInput;
  groupId?: string;
  startDate?: string;
  endDate?: string;
  discountFixed?: number;
  discountPercentage?: number;
  extraFixed?: number;
  extraPercentage?: number;
  customerComments?: string;
  adminComments?: string;
  weight?: number;
}

export interface BillingModifierInput extends BillingModifier {
  group: GroupInput;
}

export interface AddBillingModifierInput {
  input: BillingModifierInput;
}

export interface UpdateBillingModifierInput {
  input: {
    id: number;
    patch: BillingModifier;
  };
}

export interface BillingModifiersInput {
  input: GroupInput;
  month?: string;
}

export interface DeleteBillingModifierInput {
  input: {
    id: number;
  };
}

export interface DeleteAllBillingGroupModifiersInput {
  input: GroupInput;
}

/**
 * Create/Add Billing Modifier
 *
 * @param {AddBillingModifierInput} input The modifier values
 *
 * @return {BillingModifier} The created modifier
 */
export const addBillingModifier = async (group: Group, billingModifier: BillingModifier) => {
  const sqlClient = getSqlClient(USE_SINGLETON);
  const { info: { insertId } } = await query(sqlClient, Sql.addBillingModifier(billingModifier));
  const rows = await query(
    sqlClient,
    Sql.selectBillingModifier(parseInt(insertId, 10))
  );
  const result =  R.prop(0, rows) as BillingModifier;

  return { ...result, group } as BillingModifier;
};

/**
 * Get Billing Modifier By ID
 *
 * @param {Int} id The modifier values
 *
 * @return {BillingModifier} The modifier
 */
export const getBillingModifier = async (
  id: number,
) => {
  const sqlClient = getSqlClient(USE_SINGLETON);
  const keycloakAdminClient = await getKeycloakAdminClient();
  const GroupModel = Group({ keycloakAdminClient });

  const rows = await query(sqlClient, Sql.selectBillingModifier(id));
  if (rows.length === 0) {
    throw new Error('Billing modifier does not exist.');
  }

  const {groupId, ...rest} = R.prop(0, rows) as BillingModifier;
  const group: BillingGroup = await GroupModel.loadGroupByIdOrName({id: groupId});
  return {...rest, group};
};

/**
 * Get All Billing Modifiers for a Billing Group
 *
 * @param {BillingModifierInput} input The modifier values
 *
 * @return {[BillingModifier]} The created modifier
 */
export const getBillingModifiers = async (
  groupInput: GroupInput,
  month: string
) => {
  const sqlClient = getSqlClient(USE_SINGLETON);
  const keycloakAdminClient = await getKeycloakAdminClient();
  const GroupModel = Group({ keycloakAdminClient });
  const group = await GroupModel.loadGroupByIdOrName(groupInput);

  const YEAR_MONTH = 'YYYY-MM-DD HH:mm:ss';
  const monthStart = month
    ? moment(new Date(month).toISOString()).startOf('month').format(YEAR_MONTH).toString()
    : undefined;
  const monthEnd = month
    ? moment(new Date(month).toISOString()).endOf('month').format(YEAR_MONTH).toString()
    : undefined;

  const sql = Sql.getAllBillingModifierByBillingGroup(group.id, monthStart, monthEnd );
  const result = (await query(sqlClient, sql)) as [BillingModifier];
  return result.map(modifier => ({ ...modifier, group }));
};

/**
 * Update Billing Modifier
 *
 * @param {UpdateBillingModifierInput} input The modifier values
 *
 * @return {BillingModifier} The created modifier
 */
export const updateBillingModifier = async (
  id: number,
  patch?: BillingModifier,
  group?: Group | {},
) => {
  const sqlClient = getSqlClient(USE_SINGLETON);
  const keycloakAdminClient = await getKeycloakAdminClient();
  const GroupModel = Group({ keycloakAdminClient });
  if (!R.isEmpty(patch)) {
    await query(sqlClient, Sql.updateBillingModifier(id, patch));
  }

  const rows = await query(sqlClient, Sql.selectBillingModifier(id));
  if (rows.length === 0) {
    throw new Error('Billing modifier does not exist.');
  }

  const {groupId, ...rest} = R.prop(0, rows) as BillingModifier;

  if (R.isEmpty(group)){
    const loadedGroup: BillingGroup = await GroupModel.loadGroupByIdOrName({id: groupId});
    return {...rest, group: loadedGroup}
  }else {
    return {...rest, group }
  }
};

/**
 * Delete Billing Modifier
 *
 * @param {DeleteBillingModifierInput} input The modifier values
 *
 * @return {BillingModifier} The created modifier
 */
export const deleteBillingModifier = async (id: number) => {
  const sqlClient = getSqlClient(USE_SINGLETON);
  await query(sqlClient, Sql.deleteBillingModifier(id));
  return 'success';
}

/**
 * Delete All Billing Modifiers for a Billing Group
 *
 * @param {GroupInput} input The Billing Group
 *
 * @return {Boolean} Success
 */
export const deleteAllBillingGroupModifiers = async (
  groupInput: GroupInput
) => {
  const keycloakAdminClient = await getKeycloakAdminClient();
  const GroupModel = Group({ keycloakAdminClient });
  const group = await GroupModel.loadGroupByIdOrName(groupInput);

  const sqlClient = getSqlClient(USE_SINGLETON);
  const sql = Sql.deleteAllBillingModifiersByBillingGroup(group.id);
  await query(sqlClient, sql);
  return 'success';
};

export default {
  addBillingModifier,
  updateBillingModifier,
  deleteBillingModifier,
  deleteAllBillingGroupModifiers,
  getBillingModifiers
};
