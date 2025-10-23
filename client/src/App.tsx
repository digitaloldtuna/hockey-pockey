import { UnprotectedComponent, ProtectedComponent } from './components';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { ROUTES } from './constants/routes';
import { LoginPage, SignupPage, HomePage } from './pages';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme/theme';

function App() {
  return (
    <ChakraProvider value={system}>
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
    </ChakraProvider>
  );
}

export default App;
