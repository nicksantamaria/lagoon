import gql from 'graphql-tag';

gql`
  query allBillingModifiers($input:GroupInput!){
    allBillingModifiers(input: $input){
      id, 
      group {
        id
        name
      },
      startDate, 
      endDate, 
      discountFixed,
      discountPercentage,
      extraFixed,
      extraPercentage,
      customerComments,
      adminComments,
      weight
    }
  }
`;
