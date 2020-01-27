// run via node ./src/fragmentMatchers.js
// src https://www.apollographql.com/docs/react/data/fragments/

const fetch = require('node-fetch');
const fs = require('fs');

fetch(`http://localhost:3000/graphql`, {
  method: 'POST',
  headers: {
    Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1Nzk0NjYwNjMsInJvbGUiOiJhZG1pbiIsImlzcyI6ImF1dG8taWRsZXIiLCJhdWQiOiJhcGkuZGV2Iiwic3ViIjoiYXV0by1pZGxlciJ9.1bnw-pnohRnmoeveLLmb8ij8na_sU3LFVkcpoQDIQUc',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    variables: {},
    query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
  }),
})
  .then(result => result.json())
  .then(result => {
    // here we're filtering out any type information unrelated to unions or interfaces
    const filteredData = result.data.__schema.types.filter(
      type => type.possibleTypes !== null,
    );
    result.data.__schema.types = filteredData;
    fs.writeFile('./fragmentTypes.json', JSON.stringify(result.data), err => {
      if (err) {
        console.error('Error writing fragmentTypes file', err);
      } else {
        console.log('Fragment types successfully extracted!');
      }
    });
  });