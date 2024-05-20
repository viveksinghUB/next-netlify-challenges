import { useState, useEffect } from 'react';

const Home = () => {
  const [challenges, setChallenges] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    daysLeft: '',
    participants: []
  });
  const [participantName, setParticipantName] = useState('');

  useEffect(() => {
    fetch('/.netlify/functions/get-challenges')
      .then(response => response.json())
      .then(data => setChallenges(data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddParticipant = () => {
    if (participantName) {
      setFormData(prevState => ({
        ...prevState,
        participants: [...prevState.participants, participantName]
      }));
      setParticipantName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/.netlify/functions/init-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const newChallenge = await response.json();
      setChallenges(prevChallenges => [...prevChallenges, newChallenge]);
      setFormData({
        name: '',
        goal: '',
        daysLeft: '',
        participants: []
      });
    }
  };

  const handleIncrement = async (challengeId, participantName) => {
    const response = await fetch('/.netlify/functions/update-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, participantName, increment: 1 }),
    });

    if (response.ok) {
      const updatedChallenge = await response.json();
      setChallenges(prevChallenges => prevChallenges.map(challenge => 
        challenge.ref['@ref'].id === updatedChallenge.ref['@ref'].id ? updatedChallenge : challenge
      ));
    }
  };

  const handleEndChallenge = async (challengeId) => {
    const response = await fetch('/.netlify/functions/end-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId }),
    });

    if (response.ok) {
      const updatedChallenge = await response.json();
      setChallenges(prevChallenges => prevChallenges.map(challenge => 
        challenge.ref['@ref'].id === updatedChallenge.ref['@ref'].id ? updatedChallenge : challenge
      ));
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
          type="number"
          name="goal"
          placeholder="Goal"
          value={formData.goal}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="daysLeft"
          placeholder="Number of Days"
          value={formData.daysLeft}
          onChange={handleChange}
          required
        />
        <div>
          <input
            type="text"
            placeholder="Participant Name"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
          />
          <button type="button" onClick={handleAddParticipant}>Add Participant</button>
        </div>
        <ul>
          {formData.participants.map((participant, index) => (
            <li key={index}>{participant}</li>
          ))}
        </ul>
        <button type="submit">Submit</button>
      </form>
      <h2>Weekly Challenges</h2>
      <ul>
        {challenges.map((challenge, index) => {
          const endDate = new Date(challenge.data.endDate);
          const daysLeft = Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 *
