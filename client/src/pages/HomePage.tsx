const HomePage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <h2>Welcome, {user.email || 'User'}!</h2>
    </div>
  );
};

export default HomePage;
