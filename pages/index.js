import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css'; // Import CSS module

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

  const handleDecrement = async (challengeId, participantName) => {
    const response = await fetch('/.netlify/functions/update-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, participantName, increment: -1 }),
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

  const handleDeleteChallenge = async (challengeId) => {
    const response = await fetch('/.netlify/functions/delete-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId }),
    });

    if (response.ok) {
      setChallenges(prevChallenges => prevChallenges.filter(challenge => challenge.ref['@ref'].id !== challengeId));
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Weekly Challenge</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Challenge Name"
          value={formData.name}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          type="number"
          name="goal"
          placeholder="Goal"
          value={formData.goal}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          type="number"
          name="daysLeft"
          placeholder="Number of Days"
          value={formData.daysLeft}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <div className={styles.participantInput}>
          <input
            type="text"
            placeholder="Participant Name"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            className={styles.participantName}
          />
          <button type="button" onClick={handleAddParticipant} className={styles.addButton}>Add Participant</button>
        </div>
        <ul className={styles.participantList}>
          {formData.participants.map((participant, index) => (
            <li key={index} className={styles.participantItem}>{participant}</li>
          ))}
        </ul>
        <button type="submit" className={styles.submitButton}>Submit</button>
      </form>
      <div className={styles.challenges}>
        <h2 className={styles.subtitle}>Weekly Challenges</h2>
        {challenges.map((challenge, index) => {
          const endDate = new Date(challenge.data.endDate);
          const daysLeft = Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)));

          return (
            <div key={index} className={styles.challengeCard}>
              <h3>{challenge.data.name}</h3>
              <p><strong>Goal:</strong> {challenge.data.goal}</p>
              <p><strong>Days Left:</strong> {daysLeft}</p>
              <ul className={styles.progressList}>
                {challenge.data.participants.map((participant, idx) => (
                  <li key={idx} className={styles.progressItem}>
                    {participant.name}: {participant.progress}
                    <button onClick={() => handleIncrement(challenge.ref['@ref'].id, participant.name)} className={styles.incrementButton}>Increment</button>
                    <button onClick={() => handleDecrement(challenge.ref['@ref'].id, participant.name)} className={styles.decrementButton}>Decrement</button>
                  </li>
                ))}
              </ul>
              {daysLeft === 0 && (
                <p className={styles.winner}>Winner: {challenge.data.winner || 'No winner'}</p>
              )}
              {daysLeft > 0 && (
                <button onClick={() => handleEndChallenge(challenge.ref['@ref'].id)} className={styles.endButton}>End Challenge</button>
              )}
              <button onClick={() => handleDeleteChallenge(challenge.ref['@ref'].id)} className={styles.deleteButton}>Delete Challenge</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
