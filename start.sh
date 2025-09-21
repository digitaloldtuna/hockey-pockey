#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $DJANGO_PID $REACT_PID 2>/dev/null
    exit
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "Starting Hockey Pockey App..."
echo "================================"

# Start Django backend
echo "Starting Django backend on http://localhost:8000"
cd hockey
python manage.py runserver &
DJANGO_PID=$!

# Wait a moment for Django to start
sleep 3

# Start React frontend
echo "Starting React frontend on http://localhost:3000"
cd ../client
npm start &
REACT_PID=$!

echo "================================"
echo "Both servers are running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000/api/"
echo "================================"
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $DJANGO_PID $REACT_PID