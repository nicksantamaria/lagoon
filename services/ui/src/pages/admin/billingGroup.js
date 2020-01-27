import React, { useState } from 'react';
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


const yearsToShow = 2;
const currMonth = moment().format('MM').toString();
const currYear = parseInt(moment().format('YYYY'), 10);
const years = Array.from({length: yearsToShow}, (v, k) => (currYear - yearsToShow) + k + 1).sort((a, b) => b - a);

const months = [
  {name: "January", value: "01"},
  {name: "February", value: "02"},
  {name: "March", value: "03"},
  {name: "April", value: "04"},
  {name: "May", value: "05"},
  {name: "June", value: "06"},
  {name: "July", value: "07"},
  {name: "Aug", value: "08"},
  {name: "Sept", value: "09"},
  {name: "Oct", value: "10"},
  {name: "Nov", value: "11"},
  {name: "Dec", value: "12"},
];

/**
 * Displays a billingGroupCost page, given the billingGroupCost name.
 */
export const PageBillingGroup = ({ router }) => {

  const [values, setValues] = useState({ month: currMonth, year: currYear });
  const {month, year} = values;
  const handleChange = e => {
    const {name, value} = e.target;
    setValues({...values, [name]: value});
  }

  const { billingGroupName: group } = router.query;
  
  return(
  <>
    <Head>
      <title>{`${router.query.billingGroupName} | Project`}</title>
    </Head>
    <MainLayout>
      <div className="content-wrapper">
        
        <div className="leftColumn">


        <div className="monthYearContainer">
          <div className="month">
            <label htmlFor="month">Month</label>
            <select
              id="month"
              name="month"
              onChange={handleChange}
              aria-labelledby="Month"
              label='Month'
              className="selectMonth"
            >
              {months.map(m => (
                <option key={`${m.name}-${m.value}`} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>


          <div className="year">
            <label htmlFor="Year">Year</label>
            <select
              id="year"
              name="year"
              onChange={handleChange}
              aria-labelledby="year"
              label='Year'
              className="selectYear"
            >
              {years.map(year => (
                <option key={`${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          </div>
          <Query query={BillingGroupCostsQuery} variables={{ input: { name: group }, month: `${year}-${month}` }} >
            {R.compose(withQueryLoading, withQueryError)(
              ({ data: { costs } }) => <BillingGroup billingGroupCosts={costs} />
            )}
          </Query>

          
        </div>

        
        {<Query query={AllBillingModifiersQuery} variables={{ input: { name: group } }} >
            {R.compose(withQueryLoading, withQueryError)(
              ({ data: { allBillingModifiers: modifiers } }) => <AllBillingModifiers modifiers={modifiers} group={group} month={`${year}-${month}`} />
            )}
          </Query>}
          <AddBillingModifier group={group} month={`${year}-${month}`} />
        




      </div>
    </MainLayout>
    <style jsx>{`
      .content-wrapper {
        @media ${bp.tabletUp} {
          display: flex;
          justify-content: space-between;
        }
        margin: 1rem;
      }

      .monthYearContainer {
        display: flex;
        justify-content: space-between;
      }
      .month {
        width: 50%;
      }
      .year {
        width: 50%;
      }
      select {
        margin: 5px;
        width: 80%;
      }
    `}</style>
  </>
)};

export default withRouter(PageBillingGroup);
