import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme/theme';
import { AuthProvider } from './hooks/useAuthentication';
import { CreateDraft, Draft, HomePage, JoinDraft, LoginPage, Profile, SignupPage } from './pages';
import { ROUTES } from './constants/routes';
import { ProtectedRoute, UnprotectedRoute } from './components';
import { Toaster } from './theme/toaster';
import { DraftProvider } from './hooks/useDraft';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <DraftProvider>
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
            </DraftProvider>
          </AuthProvider>
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
