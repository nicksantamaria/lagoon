import React from 'react';
import css from 'styled-jsx/css';
import Button from '../Button';

import { bp, color, fontSize } from 'lib/variables';

const BillingModifiers = ({ modifiers }) => (
  <div className="modifiers">
    <div className="header">
      <label className="dates">Dates</label>
      <label className="value">Value</label>
      <label className="comments">Comments</label>
    </div>
    <div className="data-table">
      {!modifiers.length && <div className="data-none">No Billing Modifiers</div>}
      { modifiers.sort((a, b) => a.weight < b.weight ? -1 : 1).map(({
        id
        startDate,
        endDate,
        discountFixed,
        discountPercentage,
        extraFixed,
        extraPercentage,
        customerComments,
        adminComments,
        weight
      }) => (
          <div className="data-row" key={id}>
            <div className="dates">{startDate} - {endDate}</div>
            <div className="modifierValue">
              {discountFixed ? `Discount: ${discountFixed}` : ''},
              {discountPercentage ? `Discount: ${discountPercentage} %` : ''},
              {extraFixed ? `Extra: ${extraFixed}` : ''},
              {extraPercentage ? `Extra: ${extraPercentage} %` : ''},
            </div>
            <div className="customerComments">{customerComments}</div>
            <div className="adminComments">{adminComments}</div>
          </div>
        ))
      }
    </div>
    <style jsx>{`
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
            width: 15%;
            @media ${bp.extraWideUp} {
              width: 10%;
            }
          }

          &.value {
            width: 25%;
            @media ${bp.extraWideUp} {
              width: 20%;
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
                width: 10%;
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

export default BillingModifiers;
