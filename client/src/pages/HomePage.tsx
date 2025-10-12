import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  return (
    <div>
      <h2>Welcome, {user.email || 'User'}!</h2>
    </div>
  );
};

export default HomePage;