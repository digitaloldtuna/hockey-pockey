import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  console.log('HI')

  return (
    <div>
      Hello
      {/* <h2>Welcome, {user.email || 'User'}!</h2>
      <button onClick={handleLogout}>Logout</button> */}
    </div>
  );
};

export default HomePage;