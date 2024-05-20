const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event) => {
  const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });
  const data = JSON.parse(event.body);
  const { name, goal, participants, daysLeft } = data;

  // const startDate = new Date();
  // const endDate = new Date(startDate);
  // endDate.setDate(startDate.getDate() + daysLeft);

  const startDate = new Date().toISOString(); // Current date
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + parseInt(daysLeft)); // Calculate end date
  const endDateString = endDate.toISOString();


  const participantsWithProgress = participants.map(participant => ({
    name: participant,
    progress: 0
  }));

  try {
    const response = await client.query(
      q.Create(q.Collection('challenges'), {
        data: {
          name,
          goal,
          daysLeft: parseInt(daysLeft),
          participants: participants.map(participant => ({
            name: participant,
            progress: 0
          })),
          startDate,
          endDate: endDateString,
        },
      })
    );
    
    // const response = await client.query(
    //   q.Create(
    //     q.Collection('challenges'),
    //     { data: { name, goal, participants: participantsWithProgress, daysLeft, startDate, endDate, winner: null } }
    //   )
    // );
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
