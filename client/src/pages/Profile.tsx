import { useAuthentication } from '../hooks/useAuthentication';

const Profile = () => {
  const { profile } = useAuthentication();
  return <></>;
};

export default Profile;
