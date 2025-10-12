import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import HomePage from './pages/HomePage';


function App() {
  // const [message, setMessage] = useState('');

  // useEffect(() => {
  //   fetch(`api/test`)
  //     .then(res => res.json())
  //     .then(data => setMessage(data.message))
  //     .catch(err => console.error('Error:', err));
  // }, []);

  // return <>
  //   <div>This is to test the general dev experience!</div>
  //   <div> Backend Message: {message ? message : 'Loading...'}</div>
  // </>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/hockey" element={<HomePage />} />
        <Route path="/hockey/signup" element={<SignupPage />} />
        <Route path="/hockey/login" element={<LoginPage />} />
        {/* Protected routes can be wrapped here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;
