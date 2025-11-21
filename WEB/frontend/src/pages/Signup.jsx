import { useState } from "react";
import api from "../api/axiosClient";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

export default function Registration() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [acType, setAcType] = useState("student"); // default value

  const handleSignup = async () => {
    if (!name || !phone || !password || !acType) {
      Swal.fire("Oops!", "All fields are required!", "warning");
      return;
    }

    if (phone.length < 4) {
      Swal.fire("Invalid Phone", "Phone number is too short!", "error");
      return;
    }

    if (password.length < 6) {
      Swal.fire(
        "Weak Password",
        "Password must be at least 6 characters long!",
        "error"
      );
      return;
    }

    if (!["manager", "student"].includes(acType.toLowerCase())) {
      Swal.fire(
        "Invalid Account Type",
        "Account type must be either 'manager' or 'student'",
        "error"
      );
      return;
    }

    try {
      const res = await api.post("/auth/signup", {
        name,
        phone,
        password,
        ac_type: acType.toLowerCase(),
      });

      Swal.fire("Success!", res.data.message, "success");
      window.location.href = "/";
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.detail || "Signup failed",
        "error"
      );
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-100">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          Registration
        </h2>

        {/* Name */}
        <label className="text-gray-700 font-medium">Full Name</label>
        <input
          type="text"
          className="border w-full p-3 mb-4 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
        />

        {/* Phone */}
        <label className="text-gray-700 font-medium">Phone Number</label>
        <input
          type="text"
          className="border w-full p-3 mb-4 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          placeholder="Enter phone number"
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* Password */}
        <label className="text-gray-700 font-medium">Password</label>
        <input
          type="password"
          className="border w-full p-3 mb-4 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          placeholder="Create a password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Account Type */}
        <label className="text-gray-700 font-medium">Account Type</label>
        <select
          className="border w-full p-3 mb-6 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
          value={acType}
          onChange={(e) => setAcType(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="manager">Manager</option>
        </select>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold"
        >
          Sign Up
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
