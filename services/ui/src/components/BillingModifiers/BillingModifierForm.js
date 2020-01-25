import React, { useState } from 'react';
import css from 'styled-jsx/css';
import Button from 'components/Button';

const BillingModifierForm = ({group, submitHandler}) => {

  const defaultValues = {
    startDate: '', 
    endDate: '', 
    modifierType: 'discountFixed',
    modifierValue: '',
    customerComments: '',
    adminComments: '',
    weight: 0,
  };
  const [values, setValues] = useState(defaultValues);

  const handleChange = e => {
    const {name, value} = e.target;
    setValues({...values, [name]: value});
  }


  const isFormValid = values.startDate !== '' && values.endDate !== '' && values.modifierType && values.modifierValue && values.adminComments !== '';


  const formSubmitHandler = () => {
    const variables = { 
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
    };
    console.log(variables);
    submitHandler(variables)
  }

  return (
    <div>
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
  
      <Button disabled={!isFormValid} action={formSubmitHandler}>Add</Button>

      <style jsx>{`
        .addNew {
          margin-top: 3em;
        }
        .modifierInput {
          width: 100%;
          margin-bottom: 15px;
        }
      `}</style>
    </div>

  )
}

export default BillingModifierForm;