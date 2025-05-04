# Simple Task Management Application

A full-stack task management application built with the MERN stack (MongoDB, Express, React, Node.js). This project is designed to teach fullstack development to students.

## Features

- Create, read, update, and delete tasks
- Assign priority levels (high, medium, low)
- Track task status (pending, in progress, completed)
- Responsive design for both desktop and mobile

## Project Structure

The project is divided into two main parts:

### Backend

- Built with Express.js and Node.js
- RESTful API endpoints for task operations
- MongoDB database with Mongoose ODM
- MVC architecture (Models, Views, Controllers)

### Frontend

- React.js for the user interface
- React Router for navigation
- CSS for styling
- Axios for API requests

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd SimpleTaskManagment
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Install frontend dependencies
```
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/task-management
NODE_ENV=development
```

### Running the Application

1. Start the backend server
```
cd backend
npm run dev
```

2. Start the frontend development server
```
cd ../frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a single task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Learning Objectives

This project covers the following concepts:

1. **Frontend Development**
   - React components and state management
   - Form handling and validation
   - API integration
   - Responsive design

2. **Backend Development**
   - RESTful API design
   - Express middleware
   - MongoDB database operations
   - Error handling

3. **Full Stack Concepts**
   - Client-server architecture
   - CRUD operations
   - Data modeling
   - Authentication (can be added as an extension)

## Next Steps / Extensions

- Add user authentication
- Add task categories/tags
- Implement search and filtering
- Add due dates and reminders
- Create team/shared tasks

## License

This project is open source and available under the [MIT License](LICENSE).