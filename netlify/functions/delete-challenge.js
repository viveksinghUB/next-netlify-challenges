const faunadb = require('faunadb');
const { Client, query: q } = faunadb;

exports.handler = async (event) => {
  try {
    const client = new Client({
      secret: process.env.FAUNA_DB_ADMIN, // Ensure this environment variable is set
    });

    const data = JSON.parse(event.body);
    const { challengeId } = data;

    if (!challengeId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Challenge ID is required' }),
      };
    }

    const response = await client.query(
      q.Delete(q.Ref(q.Collection('challenges'), challengeId))
    );
    console.info('response:', response);
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error deleting challenge:', error.message);
    console.error('FaunaDB response:', error.requestResult);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete challenge' }),
    };
  }
};
