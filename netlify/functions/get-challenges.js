const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async () => {
  const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });

  try {
    // const response = await client.query(
    //   q.Map(
    //     q.Paginate(q.Documents(q.Collection('challenges'))),
    //     q.Lambda(x => q.Get(x))
    //   )
    // );
    const response = await client.query(
      q.Map(
        q.Paginate(
          q.Match(
            q.Index('challenges_by_ts') // assuming you have this index created
          )
        ),
        q.Lambda(x => q.Get(x))
      )
    );
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify(error),
    };
  }
};
