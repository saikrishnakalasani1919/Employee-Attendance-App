
Attendance Management System

A full-stack MERN application designed to streamline employee attendance tracking with role-based dashboards, analytics, calendar heatmaps, and time-based reporting.

This system supports two primary roles:

Employee: Check-in/Check-out, view monthly summary, recent attendance, pie-chart analytics, heatmap calendar.

Manager: View all attendance records, apply filters, export CSV reports, monitor team status, and access monthly analytical charts.

The project follows clean code practices, modular architecture, and industry-standard conventions.

1. Features
Employee Features

Secure login for employees.

Daily check-in and check-out functionality.

Display of today's attendance status.

Monthly summary including:

Present count

Late count

Absent count

Half-day count

Total hours worked

Recent seven-day attendance history.

Pie-chart visualization of monthly attendance.

GitHub-style heatmap calendar displaying attendance patterns.

Manager Features

Role-based manager login.

View all employees' attendance.

Apply filters:

Employee ID

Date

Status (present, late, absent, half-day)

Ability to reset all filters.

CSV export of complete attendance records.

Daily team status view.

Monthly analytics including:

Present/Late/Absent breakdown

Daily trend chart

System Features

JWT-based authentication.

MongoDB for persistent data storage.

Fully responsive UI built with Tailwind CSS.

Recharts-based analytics and visualizations.

Structured backend with Express, Mongoose, controllers, and middleware.


2. Project Structure

attendance-app/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── routes/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
└── frontend/
    ├── src/
    ├── package.json
    └── vite.config.js


3. Setup Instructions
Backend Setup

 1.Navigate to the backend folder:
    cd backend
 2.Install dependencies:
    npm install
 3.Create a .env file:

   PORT=5000
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_secret_key
 4.Start the backend server:
   npm run dev

4.Frontend Setup

 1.Navigate to the frontend folder:

   cd frontend


 2.Install dependencies:

   npm install


 3.Start the development server:

   npm run dev



5. Seed Data (Sample Users and Attendance)

 This project includes a seeding script to populate initial test data.

 Running the Seed Script

 Navigate to backend:

   cd backend


 Run the seed command:

   npm run seed


Technologies Used

###1.Frontend  ###

React (Vite)

Tailwind CSS

Recharts

###2.Backend  ###

Node.js

Express.js

MongoDB + Mongoose

JSON Web Tokens (JWT)
