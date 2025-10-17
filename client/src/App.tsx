import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { ProtectedComponent } from './components/ProtectedComponent';
import { Provider } from './components/ui/provider';
import { ROUTES } from './constants/routes';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route
            path={ROUTES.HOME}
            element={
              <ProtectedComponent>
                <HomePage />
              </ProtectedComponent>
            }
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
