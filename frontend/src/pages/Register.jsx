import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    employeeId: "",
    department: "",
  });

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const registerUser = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.token) {
      navigate("/login");
      alert("Registered! Please login.");
    } else {
      alert(data.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={registerUser}
        className="bg-white p-8 rounded shadow-md w-96 space-y-3"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <input
          name="name"
          placeholder="Full Name"
          className="w-full p-2 border rounded"
          onChange={onChange}
        />

        <input
          name="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          onChange={onChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          onChange={onChange}
        />

        <select
          name="role"
          className="w-full p-2 border rounded"
          onChange={onChange}
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>

        <input
          name="employeeId"
          placeholder="Employee ID"
          className="w-full p-2 border rounded"
          onChange={onChange}
        />

        <input
          name="department"
          placeholder="Department"
          className="w-full p-2 border rounded"
          onChange={onChange}
        />

        <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Register
        </button>

        <p
          onClick={() => navigate("/login")}
          className="text-blue-500 text-center cursor-pointer"
        >
          Back to Login
        </p>
      </form>
    </div>
  );
}
