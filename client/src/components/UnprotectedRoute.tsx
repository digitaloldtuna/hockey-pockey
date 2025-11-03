import { AbsoluteCenter, Spinner } from '@chakra-ui/react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuthentication } from '../hooks/useAuthentication';

export function UnprotectedRoute() {
  const navigate = useNavigate();
  const { loading, session } = useAuthentication();

  if (loading || !session) {
    return (
      <AbsoluteCenter h="100vh">
        <Spinner size="xl" color="blue.500" />
      </AbsoluteCenter>
    );
  }

  if (session.authenticated) {
    navigate(ROUTES.HOME);
  }
  return <Outlet />;
}
