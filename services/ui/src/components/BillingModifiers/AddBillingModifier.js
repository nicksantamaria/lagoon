import React, { useState } from 'react';
import css from 'styled-jsx/css';
import { Mutation } from 'react-apollo';

import { color } from 'lib/variables';
import AddBillingModifierMutation from '../../lib/mutation/AddBillingModifier';
import AllBillingModifiersQuery from 'lib/query/AllBillingModifiers';

import BillingModifierForm from "./BillingModifierForm";

const AddBillingModifier = ({ group }) => {

  return(
    <div className="addBillingModifier">

      <Mutation 
        mutation={AddBillingModifierMutation} 
        refetchQueries={[{ query: AllBillingModifiersQuery, variables: { input: { name: group } } }]}
      >
        {(addBillingModifier, { loading, called, error, data }) => {

          const addBillingModifierHandler = (input) => { 
            addBillingModifier({ variables: { input } });
          };

          if (!error && called && loading) {
            return <div>Adding Billing Modifier...</div>;
          }

          return (
            <div className="addNew">
              { error ? <div className="error">{error.message.replace('GraphQL error:', '').trim()}</div> : "" } 
              <BillingModifierForm group={group} submitHandler={addBillingModifierHandler} />
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
      `}</style>
    </div>
  );
};

export default AddBillingModifier;
