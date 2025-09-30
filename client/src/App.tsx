import React, { useEffect, useState } from 'react';

type ApiResponse = {
  message: string;
};

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/hello/`)
      .then((res) => res.json())
      .then((data: ApiResponse) => setMessage(data.message))
      .catch((error) => console.error('Error fetching message:', error));
  }, []);

  return <h1>test: {message}</h1>;
};

export default App;
