import React, { useState } from 'react';
import css from 'styled-jsx/css';
import Button from 'components/Button';
import { Mutation } from 'react-apollo';
import Me from 'lib/query/Me';
import { bp, color, fontSize } from 'lib/variables';
import AddBillingModifierMutation from '../../lib/mutation/AddBillingModifier';

const AddBillingModifier = ({ group }) => {

  // { 
  // group: GroupInput!
  // startDate: String!
  // endDate: String!
  // discountFixed: Float
  // discountPercentage: Float
  // extraFixed: Float
  // extraPercentage: Float
  // customerComments: String
  // adminComments: String!
  // weight: Int
  // }

  const defaultValues = {
    startDate: '', 
    endDate: '', 
    type: '',
    value: '',
    customerComments: '',
    adminComments: '',
    weight: 0,
  };
  const [values, setValues] = useState(defaultValues);

  const handleChange = e => {
    const {name, value} = e.target;
    setValues({...values, [name]: value});
  }


  const isFormValid = values.startDate !== '' && values.endDate !== '' && values.type && values.value && values.adminComments !== '';

  return(
    <div className="addBillingModifier">

      <Mutation mutation={AddBillingModifierMutation} refetchQueries={[{ query: Me }]}>
        {(addBillingModifier, { loading, called, error, data }) => {

          const addBillingModifierHandler = () => { 
            addBillingModifier({
              variables: {
                input: { 
                  group: { name: group},
                  startDate: values.startDate, 
                  endDate: values.endDate,
                  discountFixed: values.discountFixed, 
                  discountPercentage: values.discountPercentage, 
                  extraFixed: values.extraFixed, 
                  extraPercentage: values.extraPercentage,
                  customerComments: values.customerComments,
                  adminComments: values.adminComments,
                  weight: values.weight
                  
                }
              }
            });
            setValues(defaultValues);
          };

          if (!error && called && loading) {
            return <div>Adding SSH Key...</div>;
          }

          return (
            <div className="addNew">

              { error ? <div className="error">{error.message.replace('GraphQL error:', '').trim()}</div> : "" } 

              <div>
                <label>Start Date (YYYY-MM-DD)</label>
                <input
                  aria-labelledby="startDate"
                  id="startDate"
                  name="startDate"
                  label='Start Date'
                  className="modifierInput"
                  type="text"
                  value={values.startDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>End Date (YYYY-MM-DD)</label>
                <input
                  aria-labelledby="endDate"
                  id="endDate"
                  name="endDate"
                  label='End Date'
                  className="modifierInput"
                  type="text"
                  value={values.endDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="Modifier Type">Type</label>
                <select
                  id="modifierType"
                  name="modifierType"
                  onChange={handleChange}
                  aria-labelledby="modifierType"
                  label='Modifier Type'
                  className="modifierInput"
                >
                  {[
                    {name: 'Discount: Fixed', value: 'discountFixed'}, 
                    {name: 'Discount: Percentage (0-100)', value: 'discountPercentage'},
                    {name: 'Extra: Fixed', value: 'extraFixed'}, 
                    {name: 'Extra: Percentage (0-100)', value: 'extraPercentage'} 
                  ].map(modifier => (
                    <option key={`${modifier.name}-${modifier.value}`} value={modifier.value}>
                      {modifier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Value</label>
                <input
                  aria-labelledby="modifierValue"
                  id="modifierValue"
                  name="modifierValue"
                  label='Modifier Value'
                  className="modifierInput"
                  type="text"
                  value={values.modifierValue}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Admin Comments</label>
                <textarea
                  aria-labelledby="adminComments"
                  id='adminComments'
                  name='adminComments'
                  label='Admin Comments'
                  className="modifierInput"
                  type="text"
                  onChange={handleChange}
                  value={values.adminComments}
                  placeholder="AIO Internal Messaging"/>
              </div>

              <div>
                <label>Customer Comments</label>
                <textarea
                  aria-labelledby="customerComments"
                  id='customerComments'
                  name='customerComments'
                  label='Customer Comments'
                  className="modifierInput"
                  type="text"
                  onChange={handleChange}
                  value={values.customerComments}
                  placeholder="Customer Messaging"/>
              </div>

              <Button disabled={!isFormValid} action={addBillingModifierHandler}>Add</Button>

            </div>

          );
        }}
      </Mutation>

      <style jsx>{`
        .error {
          color: #e64545;
        }
        .addNew {
          margin-top: 3em;
        }
        .modifierInput {
          width: 100%;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
};

export default AddBillingModifier;
