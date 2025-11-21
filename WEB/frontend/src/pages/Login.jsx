import { useState } from "react";
import api from "../api/axiosClient";
import Swal from "sweetalert2";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // prevent page reload

    if (!phone || !password) {
      Swal.fire("Error", "Phone and Password are required", "error");
      return;
    }

    try {
      const res = await api.post("/auth/login", { phone, password });
      const { user_id, name, ac_type } = res.data;

      localStorage.setItem("user_id", user_id);
      localStorage.setItem("user_name", name);
      localStorage.setItem("ac_type", ac_type);

      Swal.fire("Success!", "Logged in successfully.", "success");

      // Redirect based on ac_type
      switch (ac_type.toLowerCase()) {
        case "admin":
          window.location.href = "/admin";
          break;
        case "manager":
          window.location.href = "/manager";
          break;
        case "student":
          window.location.href = "/student";
          break;
        default:
          window.location.href = "/";
          break;
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.detail || "Login failed", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-100">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Login
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="password"
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg cursor-pointer font-semibold"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <span
            onClick={() => (window.location.href = "/signup")}
            className="text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
