import React from 'react';
import * as R from 'ramda';
import moment from 'moment';
import { withRouter } from 'next/router';
import Head from 'next/head';
import { Query } from 'react-apollo';
import MainLayout from 'layouts/MainLayout';
import BillingGroupCosts from 'lib/query/BillingGroupCosts';
import BillingGroup from "components/BillingGroup";
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
  
  const variables = { input: { name: router.query.billingGroupName }, month: currMonth };
  return(
  <>
    <Head>
      <title>{`${router.query.billingGroupName} | Project`}</title>
    </Head>
    <Query
      query={BillingGroupCosts}
      variables={variables}
    >
      {R.compose(
        withQueryLoading,
        withQueryError,
      )(({ data: { costs } }) => {

        return (
          <MainLayout>
            
            <div className="content-wrapper">
              <BillingGroup billingGroupCosts={costs} />
              <AddBillingModifier group={router.query.billingGroupName} />
            </div>
            <style jsx>{`
              .content-wrapper {
                @media ${bp.tabletUp} {
                  display: flex;
                  justify-content: space-between;
                }
              }
            `}</style>
          </MainLayout>
        );
      })}
    </Query>
  </>
)};

export default withRouter(PageBillingGroup);
