import gql from "graphql-tag";

export default gql`
  mutation addBillingModifier( $input: BillingModiferInput!) {
    addBillingModifier(input: $input){
      id, group { id, name, type }, startDate, endDate, discountFixed, discountPercentage, extraFixed, extraPercentage, customerComments, adminComments 
    }
  }
`;