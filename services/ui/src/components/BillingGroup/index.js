import React from 'react';
import css from 'styled-jsx/css';
import { bp, color, fontSize } from 'lib/variables';


const BillingModifiers = ({modifiers}) => modifiers.map(
  ({ id, startDate, endDate, discountFixed, discountPercentage, extraFixed, extraPercentage, customerComments, adminComments, weight }) => (
    <div className="modifierValue" key={id}>
      <div>
        {discountFixed !== 0 ? `- $${discountFixed}` : ''}
      </div>
      <div>
        {discountPercentage !== 0 ? `-  ${discountPercentage}%` : ''}
      </div>
      <div>
        {extraFixed !== 0 ? `+ $${extraFixed}` : ''}
      </div>
      <div>
        {extraPercentage !== 0 ? `+  ${extraPercentage}%` : ''}
      </div>
    </div>
  )
);

const BillingGroup = ({ billingGroupCosts }) => {

  const { id, name, currency, availability, hitCost, storageCost, environmentCost, total, modifiers, projects } = billingGroupCosts;
  return(
    <div className="billingGroup">
      <div className="data-table">

        <div className="data-row">
          <div>
            
            <h1>{name} - ({currency})</h1><br/>
            <div>Availability: {availability}</div>
            
          </div>
        </div>

        <div className="data-row">
          <div>Hits:</div><div className="value"> ${hitCost}</div>
        </div>

        <div className="data-row">
          <div>Storage:</div><div className="value"> ${storageCost}</div>
        </div>

        <div className="data-row">
          <div>Dev:</div><div className="value"> ${environmentCost.dev}</div>
        </div>

        <div className="data-row">
          <div>Prod:</div><div className="value"> ${environmentCost.prod}</div><br/>
        </div>

        <div className="data-row">
          <div>modifiers:</div><div className="value"> { modifiers.length == 0 ? 'No Billing Modifiers This Month' : <BillingModifiers modifiers={modifiers} />}</div>
        </div>

        <div className="data-row total">
          <div className="">Total:</div> <div className="value"> ${total.toFixed(2)}</div>
        </div>

      </div>

      <style jsx>{`
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
            display: flex;
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

            &.total {
              width: 100%;
              background-color: gray;
              color: white;
            }

            .value {
              width: 100%;
              text-align: right;
            }

            & > div {
              padding-left: 20px;
              @media ${bp.wideDown} {
                padding-right: 40px;
              }
              @media ${bp.wideUp} {


                &.created {
                  width: 20%;
                }

                &.download {
                  align-self: center;
                  width: 25%;
                  @media ${bp.extraWideUp} {
                    width: 20%;
                  }
                }
              }

              &.backupid {
                word-break: break-word;
                overflow: hidden;
                text-overflow: ellipsis;
                @media ${bp.wideUp} {
                  width: 45%;
                }
                @media ${bp.extraWideUp} {
                  width: 50%;
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
  )
};

export default BillingGroup;
