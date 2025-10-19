import { UnprotectedComponent, ProtectedComponent, Provider } from './components';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { ROUTES } from './constants/routes';
import { LoginPage, SignupPage, HomePage } from './pages';

function App() {
  return (
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route
            path={ROUTES.SIGNUP}
            element={
              <UnprotectedComponent>
                <SignupPage />
              </UnprotectedComponent>
            }
          />
          <Route
            path={ROUTES.LOGIN}
            element={
              <UnprotectedComponent>
                <LoginPage />
              </UnprotectedComponent>
            }
          />
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
