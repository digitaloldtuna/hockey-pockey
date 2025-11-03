import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme/theme';
import { AuthProvider } from './hooks/useAuthentication';
import { UnprotectedRoute } from './components/UnprotectedRoute';
import { HomePage, LoginPage, SignupPage } from './pages';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ROUTES } from './constants/routes';
import CreateDraft from './pages/draft/CreateDraft';
import JoinDraft from './pages/draft/JoinDraft';

function App() {
  return (
    <ChakraProvider value={system}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<UnprotectedRoute />}>
              <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.DRAFT.CREATE} element={<CreateDraft />} />
              <Route path={ROUTES.DRAFT.JOIN} element={<JoinDraft />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
