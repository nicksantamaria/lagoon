import React from 'react';
import * as R from 'ramda';
import moment from 'moment';
import { withRouter } from 'next/router';
import Head from 'next/head';
import { Query } from 'react-apollo';
import MainLayout from 'layouts/MainLayout';

import BillingGroupCostsQuery from 'lib/query/BillingGroupCosts';
import AllBillingModifiersQuery from 'lib/query/AllBillingModifiers';

import BillingGroup from "components/BillingGroup";
import AllBillingModifiers from "components/BillingModifiers/AllBillingModifiers";
import AddBillingModifier from "components/BillingModifiers/AddBillingModifier";

import Breadcrumbs from 'components/Breadcrumbs';
import withQueryLoading from 'lib/withQueryLoading';
import withQueryError from 'lib/withQueryError';
import { bp, color } from 'lib/variables';


const currMonth = moment().format('YYYY-MM').toString();

/**
 * Displays a billingGroupCost page, given the billingGroupCost name.
 */
export const PageBillingGroup = ({ router }) => {

  const { billingGroupName: group } = router.query;
  
  return(
  <>
    <Head>
      <title>{`${router.query.billingGroupName} | Project`}</title>
    </Head>
    <MainLayout>
      <div className="content-wrapper">

        <Query query={BillingGroupCostsQuery} variables={{ input: { name: group }, month: currMonth }} >
          {R.compose(withQueryLoading, withQueryError)(
            ({ data: { costs } }) => <BillingGroup billingGroupCosts={costs} />
          )}
        </Query>

        <div>
          {<Query query={AllBillingModifiersQuery} variables={{ input: { name: group } }} >
            {R.compose(withQueryLoading, withQueryError)(
              ({ data: { allBillingModifiers: modifiers } }) => <AllBillingModifiers modifiers={modifiers} group={group} />
            )}
          </Query>}
          <AddBillingModifier group={group} />
        </div>

      </div>
    </MainLayout>
    <style jsx>{`
      .content-wrapper {
        @media ${bp.tabletUp} {
          display: flex;
          justify-content: space-between;
        }
      }
    `}</style>
  </>
)};

export default withRouter(PageBillingGroup);
