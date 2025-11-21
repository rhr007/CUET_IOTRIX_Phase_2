import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const res = await api.get("admin/pending");
      setPendingUsers(res.data);
      setLoading(false);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch pending users", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Approve user
  const handleApprove = async (userId) => {
    try {
      await api.post(`admin/approve/${userId}`);
      Swal.fire("Success", "User approved!", "success");
      setPendingUsers(pendingUsers.filter((user) => user.id !== userId));
    } catch (err) {
      Swal.fire("Error", "Approval failed!", "error");
    }
  };

  // Reject user
  const handleReject = async (userId) => {
    try {
      await api.post(`admin/reject/${userId}`);
      Swal.fire("Success", "User rejected!", "success");
      setPendingUsers(pendingUsers.filter((user) => user.id !== userId));
    } catch (err) {
      Swal.fire("Error", "Rejection failed!", "error");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-200 to-pink-100">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-white shadow-md border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-700">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* Pending Users */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Pending Users
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : pendingUsers.length === 0 ? (
          <p className="text-gray-500">No pending users</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700">
                    {user.name}
                  </h3>
                  <p className="text-gray-600">Phone: {user.phone}</p>
                  <p className="text-gray-600 capitalize">
                    Account Type:{" "}
                    <span
                      className={`font-bold ${
                        user.ac_type === "manager"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {user.ac_type}
                    </span>
                  </p>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
