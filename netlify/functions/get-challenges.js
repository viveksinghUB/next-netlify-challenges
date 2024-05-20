const faunadb = require('faunadb');
const { Client, query: q } = faunadb;

exports.handler = async (event) => {
  try {
    const client = new Client({
      secret: process.env.FAUNADB_SECRET,
    });

    const response = await client.query(
      q.Map(
        q.Paginate(q.Match(q.Index('all_challenges')), { size: 1000 }),
        q.Lambda('X', q.Get(q.Var('X')))
      )
    );

    const challenges = response.data;

    // Sort challenges by timestamp (ts) in descending order
    challenges.sort((a, b) => b.ts - a.ts);

    return {
      statusCode: 200,
      body: JSON.stringify(challenges),
    };
  } catch (error) {
    console.error('Error fetching challenges:', error.message);
    if (error.requestResult) {
      console.error('FaunaDB response:', JSON.stringify(error.requestResult));
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch challenges' }),
    };
  }
};
