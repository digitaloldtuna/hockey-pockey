import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/players/');
      setPlayers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch players: ' + err.message);
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = async (playerData) => {
    try {
      const response = await axios.post('/api/players/create/', playerData);
      setPlayers([...players, response.data]);
    } catch (err) {
      setError('Failed to add player: ' + err.message);
      console.error('Error adding player:', err);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Hockey Stats App</h1>
          <p>Loading players...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hockey Stats App</h1>
        <p>Connected to Django Backend!</p>

        {error && (
          <div style={{ color: 'red', margin: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ margin: '20px' }}>
          <h2>Players ({players.length})</h2>
          {players.map(player => (
            <div key={player.id} style={{
              border: '1px solid #ccc',
              margin: '10px',
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }}>
              <h3>{player.name}</h3>
              <p><strong>Position:</strong> {player.position}</p>
              <p><strong>Team:</strong> {player.team}</p>
              <p><strong>Goals:</strong> {player.goals} | <strong>Assists:</strong> {player.assists}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => addPlayer({
            name: 'New Player',
            position: 'Forward',
            team: 'Test Team',
            goals: 0,
            assists: 0
          })}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#61dafb',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Add Test Player
        </button>
      </header>
    </div>
  );
}

export default App;
