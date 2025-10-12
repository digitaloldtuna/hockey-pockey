import React, { useEffect, useState } from 'react';
import './App.css';

const apiUrl = process.env.REACT_APP_URL;

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${apiUrl}/test`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error('Error:', err));
  }, []);

  return <>
    <div>This is to test the general dev experience!</div>
    <div>API Prefix: {apiUrl}</div>
    <div> Backend Message: {message ? message : 'Loading...'}</div>
  </>;
}

export default App;
