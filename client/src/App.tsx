import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme/theme';
import { AuthProvider } from './hooks/useAuthentication';
import { CreateDraft, Draft, HomePage, JoinDraft, LoginPage, Profile, SignupPage } from './pages';
import { ROUTES } from './constants/routes';
import { ProtectedRoute, UnprotectedRoute } from './components';
import { Toaster } from './theme/toaster';

function App() {
  return (
    <ChakraProvider value={system}>
      <Toaster />
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
              <Route path="/draft/:draftId" element={<Draft />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
