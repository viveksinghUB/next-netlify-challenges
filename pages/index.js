import { useState, useEffect } from 'react';

const Home = () => {
  const [challenges, setChallenges] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    participants: '',
    goal: '',
    achievement: '',
    winner: ''
  });

  useEffect(() => {
    fetch('/.netlify/functions/get-challenges')
      .then(response => response.json())
      .then(data => setChallenges(data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/.netlify/functions/add-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const newChallenge = await response.json();
      setChallenges(prevChallenges => [...prevChallenges, newChallenge]);
      setFormData({
        name: '',
        participants: '',
        goal: '',
        achievement: '',
        winner: ''
      });
    }
  };

  return (
    <div>
      <h1>Weekly Challenge</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Challenge Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="participants"
          placeholder="Participants"
          value={formData.participants}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="goal"
          placeholder="Goal"
          value={formData.goal}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="achievement"
          placeholder="Achievement"
          value={formData.achievement}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="winner"
          placeholder="Winner"
          value={formData.winner}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>
      <h2>Weekly Winners</h2>
      <ul>
        {challenges.map((challenge, index) => (
          <li key={index}>
            {challenge.data.winner} won the {challenge.data.name} challenge
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
