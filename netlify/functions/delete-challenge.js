// netlify/functions/delete-challenge.js

const faunadb = require('faunadb');
const { Client, query: q } = faunadb;

exports.handler = async (event) => {
  try {
    const client = new Client({
      secret: process.env.FAUNA_SECRET_KEY // Use environment variable to store your FaunaDB secret key
    });

    const data = JSON.parse(event.body);
    const { challengeId } = data;

    const response = await client.query(
      q.Delete(
        q.Ref(q.Collection('Challenges'), challengeId)
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete challenge' }),
    };
  }
};
