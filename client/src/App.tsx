import React, { useEffect, useState } from 'react';

type ApiResponse = {
  message: string;
};

const App: React.FC = () => {
  // const [message, setMessage] = useState<string>('');

  // useEffect(() => {
  //   fetch('http://localhost:8000/api/hello/')
  //     .then((res) => res.json())
  //     .then((data: ApiResponse) => setMessage(data.message))
  //     .catch((error) => console.error('Error fetching message:', error));
  // }, []);

  // return <h1>{message}</h1>;
  return <h1>HERE I AM HERE</h1>
};

export default App;
