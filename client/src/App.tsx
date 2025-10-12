import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { ROUTES } from './constants/routes';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import HomePage from './pages/HomePage';


function App() {
  return (
    <BrowserRouter basename="/hockey">
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
