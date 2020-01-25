import * as R from 'ramda';
import React from 'react';
import css from 'styled-jsx/css';
import Button from '../Button';
import { Mutation, Query } from 'react-apollo';

import AllBillingModifiersQuery from 'lib/query/AllBillingModifiers';
import DeleteBillingModifierMutation from 'lib/mutation/DeleteBillingModifier';

import withQueryLoading from 'lib/withQueryLoading';
import withQueryError from 'lib/withQueryError';

import { bp, color, fontSize } from 'lib/variables';
import { json } from 'body-parser';

const AllBillingModifiers = ({group, modifiers}) => (
  <div className="modifiers">
    <h2>All Billing Modifiers</h2>
    <div className="header">
      <label className="dates">Dates</label>
      <label className="value">Value</label>
      <label className="comments">Comments</label>
    </div>

          <div className="data-table">
            {!modifiers.length && (
              <div className="data-none">No Billing Modifiers</div>
            )}
            {modifiers
              .sort((a, b) => (a.weight < b.weight ? -1 : 1))
              .map(({ id, startDate, endDate, discountFixed, discountPercentage, extraFixed, extraPercentage, customerComments, adminComments, weight }) => (
                  <div className="data-row" key={id}>
                    <div className="dates">{startDate.replace('00:00:00', '')} - {endDate.replace('00:00:00', '')}
                    </div>
                    <div className="modifierValue">
                      {discountFixed ? `Discount: ${discountFixed}` : ''}
                      {discountPercentage ? `Discount: ${discountPercentage} %` : ''}
                      {extraFixed ? `Extra: ${extraFixed}` : ''}
                      {extraPercentage ? `Extra: ${extraPercentage} %` : ''}
                    </div>
                    {customerComments ? (<div className="customerComments">{customerComments}</div>) : ('')}
                    <div className="adminComments">{adminComments}</div>
                    <div className="delete">
                      <Mutation
                        mutation={DeleteBillingModifierMutation}
                        refetchQueries={[{ query: AllBillingModifiersQuery, variables: { input: { name: group } } }]}
                      >
                        {(
                          deleteBillingModifier,
                          { loading, called, error, data }
                        ) => {
                          if (error) {
                            return <div>{error.message}</div>;
                          }

                          if (called) {
                            return <div>Deleting Billing Modifier...</div>;
                          }

                          return (
                            <Button
                              action={() =>
                                deleteBillingModifier({
                                  variables: { input: { id } }
                                })
                              }
                            >
                              Delete
                            </Button>
                          );
                        }}
                      </Mutation>
                    </div>
                  </div>
                )
              )}
          </div>


    <style jsx>{`
      .modifiers {
        width: 100%;
      }
      .header {
        @media ${bp.wideUp} {
          align-items: center;
          display: flex;
          margin: 0 0 14px;
          padding-right: 40px;
        }
        @media ${bp.smallOnly} {
          flex-wrap: wrap;
        }
        @media ${bp.tabletUp} {
          margin-top: 40px;
        }

        label {
          display: none;
          padding-left: 20px;
          @media ${bp.wideUp} {
            display: block;
          }

          &.dates {
            width: 35%;
            @media ${bp.extraWideUp} {
              width: 50%;
            }
          }

          &.value {
            width: 45%;
            @media ${bp.extraWideUp} {
              width: 45%;
            }
          }

          &.comments {
            width: 45%;
            @media ${bp.extraWideUp} {
              width: 55%;
            }
          }
        }
      }

      .data-table {
        background-color: ${color.white};
        border: 1px solid ${color.lightestGrey};
        border-radius: 3px;
        box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.03);

        .data-none {
          border: 1px solid ${color.white};
          border-bottom: 1px solid ${color.lightestGrey};
          border-radius: 3px;
          line-height: 1.5rem;
          padding: 8px 0 7px 0;
          text-align: center;
        }

        .data-row {
          border: 1px solid ${color.white};
          border-bottom: 1px solid ${color.lightestGrey};
          border-radius: 0;
          line-height: 1.5rem;
          padding: 8px 0 7px 0;
          @media ${bp.wideUp} {
            display: flex;
            justify-content: space-between;
            padding-right: 15px;
          }

          & > div {
            padding-left: 20px;
            @media ${bp.wideDown} {
              padding-right: 40px;
            }
            @media ${bp.wideUp} {
              &.dates {
                width: 50%;
              }

              &.value {
                width: 20%;
              }

              &.comments {
                align-self: center;
                width: 25%;
                @media ${bp.extraWideUp} {
                  width: 20%;
                }
              }
            }
          }

          &:hover {
            border: 1px solid ${color.brightBlue};
          }

          &:first-child {
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
          }

          &:last-child {
            border-bottom-left-radius: 3px;
            border-bottom-right-radius: 3px;
          }
        }
      }
    `}</style>
  </div>
);

export default AllBillingModifiers;
