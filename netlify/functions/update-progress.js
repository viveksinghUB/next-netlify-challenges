const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event) => {
  const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });
  const data = JSON.parse(event.body);
  const { challengeId, participantName, increment } = data;

  try {
    const challenge = await client.query(
      q.Get(q.Ref(q.Collection('challenges'), challengeId))
    );

    const updatedParticipants = challenge.data.participants.map(participant => {
      if (participant.name === participantName) {
        return { ...participant, progress: participant.progress + increment };
      }
      return participant;
    });

    const response = await client.query(
      q.Update(q.Ref(q.Collection('challenges'), challengeId), {
        data: { participants: updatedParticipants }
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
