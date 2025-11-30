const mongoose = require("mongoose");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
require("dotenv").config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for seeding");

  await User.deleteMany({});
  await Attendance.deleteMany({});

  const users = await User.insertMany([
    {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "manager",
      employeeId: "ADM001",
      department: "Management",
    },
    {
      name: "Sai Krishna",
      email: "sai@example.com",
      password: "password123",
      role: "employee",
      employeeId: "EMP001",
      department: "IT",
    }
  ]);

  console.log("Users seeded");

  await Attendance.insertMany([
    {
      userId: users[1]._id,
      date: "2025-11-29",
      checkInTime: new Date("2025-11-29T09:10:00"),
      checkOutTime: new Date("2025-11-29T17:00:00"),
      status: "present",
      totalHours: 7.5
    },
    {
      userId: users[1]._id,
      date: "2025-11-30",
      checkInTime: new Date("2025-11-30T11:23:27"),
      checkOutTime: new Date("2025-11-30T11:30:09"),
      status: "late",
      totalHours: 0.11
    }
  ]);

  console.log("Attendance seeded");
  process.exit();
}

seed();
