const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event) => {
  const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });
  const data = JSON.parse(event.body);
  const { challengeId } = data;

  try {
    const challenge = await client.query(
      q.Get(q.Ref(q.Collection('challenges'), challengeId))
    );

    const winner = challenge.data.participants
      .filter(participant => participant.progress > challenge.data.goal)
      .sort((a, b) => b.progress - a.progress)[0]?.name || 'No winner';

    const response = await client.query(
      q.Update(q.Ref(q.Collection('challenges'), challengeId), {
        data: { winner }
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify(error),
    };
  }
};
