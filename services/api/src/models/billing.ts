import moment from 'moment';
import R from 'ramda';
import { Group, BillingGroup } from './group';
import { getKeycloakAdminClient } from '../clients/keycloak-admin';
import { getSqlClient, USE_SINGLETON } from '../clients/sqlClient';
import { query } from '../util/db';
import Sql from '../resources/billing/sql';


import { projectEnvironmentsWithData } from '../models/environment';
import {
  calculateProjectEnvironmentsTotalsToBill,
  getProjectsCosts,
  BillingGroupCosts
} from '../resources/billing/billingCalculations';


import { GroupInput } from './group';

export interface BillingModifier {
  id?: number;
  group?: Group | GroupInput;
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

const loadGroup = async (group: GroupInput) => {
  const keycloakAdminClient = await getKeycloakAdminClient();
  const GroupModel = Group({ keycloakAdminClient });
  return GroupModel.loadGroupByIdOrName(group);
};

export const convertDateToMYSQLDateTimeFormat = (date: string) => {
  const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
  return moment(new Date(date).toISOString())
    .format(DATE_FORMAT)
    .toString();
};

const prepareAddBillingModifierFromInput = async (
  input: BillingModifierInput
) => {
  const { group: groupInput, ...rest } = input;
  const group = await loadGroup(groupInput);

  const startDate = convertDateToMYSQLDateTimeFormat(rest.startDate);
  const endDate = convertDateToMYSQLDateTimeFormat(rest.endDate);

  return {
    group,
    billingModifier: { ...rest, group_id: group.id, startDate, endDate }
  };
};

/**
 * Create/Add Billing Modifier
 *
 * @param {AddBillingModifierInput} input The modifier values
 *
 * @return {BillingModifier} The created modifier
 */
export const addBillingModifier = async (input: BillingModifierInput) => {
  const sqlClient = getSqlClient(USE_SINGLETON);

  const { group, billingModifier } = await prepareAddBillingModifierFromInput( input );
  const { info: { insertId } } = await query(sqlClient, Sql.addBillingModifier(billingModifier));
  const rows = await query(
    sqlClient,
    Sql.selectBillingModifier(parseInt(insertId, 10))
  );
  const result =  R.prop(0, rows) as BillingModifier;

  return { ...result, group } as BillingModifier;
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

const prepareUpdateBillingModifierFromInput = async (
  id: number,
  input: BillingModifier
) => {
  const isGroupInputExists =
    typeof input != 'undefined' &&
    input.group &&
    (input.group.id || input.group.name);
  const group: BillingGroup | {} = isGroupInputExists
    ? (await loadGroup(input.group)).id
    : {};
  const group_id = isGroupInputExists ? { group_id: (group as BillingGroup).id } : {};

  const startDate =
    typeof input != 'undefined' && input.startDate
      ? { startDate: convertDateToMYSQLDateTimeFormat(input.startDate) }
      : {};
  const endDate =
    typeof input != 'undefined' && input.endDate
      ? { endDate: convertDateToMYSQLDateTimeFormat(input.endDate) }
      : {};

  return {
    group,
    billingModifier: { ...input, ...group_id, ...startDate, ...endDate }
  };
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
  input: BillingModifier
) => {
  const sqlClient = getSqlClient(USE_SINGLETON);

  const { group, billingModifier: patch } = await prepareUpdateBillingModifierFromInput(id, input);
  if (!R.isEmpty(patch)) {
    await query(sqlClient, Sql.updateBillingModifier(id, patch));
  }

  const rows = await query(sqlClient, Sql.selectBillingModifier(id));
  if (rows.length === 0) {
    throw new Error('Billing modifier does not exist.');
  }
  const result =  R.prop(0, rows) as BillingModifier;

  return { ...result, group };
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
