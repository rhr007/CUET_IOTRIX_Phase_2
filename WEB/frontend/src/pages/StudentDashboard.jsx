import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Swal from "sweetalert2";

export default function StudentDashboard() {
  const [tokenInput, setTokenInput] = useState("");
  const [usedTokens, setUsedTokens] = useState([]);
  const [loadingUsed, setLoadingUsed] = useState(true);

  const studentId = localStorage.getItem("user_id"); // logged-in student

  // Fetch tokens used by this student
  const fetchUsedTokens = async () => {
    try {
      const res = await api.get(`/student/used/${studentId}`);
      setUsedTokens(res.data);
      setLoadingUsed(false);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch used tokens", "error");
      setLoadingUsed(false);
    }
  };

  useEffect(() => {
    fetchUsedTokens();
  }, []);

  // Use a token
  const handleUseToken = async () => {
    if (!tokenInput) {
      Swal.fire("Error", "Please enter a token", "error");
      return;
    }

    try {
      const res = await api.post(`/student/use/${studentId}/${tokenInput}`);
      Swal.fire(
        "Success",
        `Token used successfully: ${res.data.token_value}`,
        "success"
      );
      setTokenInput("");
      fetchUsedTokens(); // refresh used tokens
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.detail || "Failed to use token",
        "error"
      );
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
        <h1 className="text-2xl font-bold text-indigo-700">
          Student Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Use Token Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4">
            Use a Token
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              className="border p-3 rounded-lg flex-1 focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Enter token value"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <button
              onClick={handleUseToken}
              className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-all cursor-pointer"
            >
              Use
            </button>
          </div>
        </div>

        {/* Used Tokens Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4">
            Tokens You Have Used
          </h2>
          {loadingUsed ? (
            <p className="text-gray-500">Loading...</p>
          ) : usedTokens.length === 0 ? (
            <p className="text-gray-500">You haven't used any tokens yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usedTokens.map((token) => (
                <div
                  key={token.id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <p className="font-semibold text-indigo-700">
                    Token: {token.token_value}
                  </p>
                  <p className="text-gray-600">
                    Used At:{" "}
                    {token.used_at
                      ? new Date(token.used_at).toLocaleString()
                      : "N/A"}
                  </p>
                  <p className="text-gray-600">
                    Given By Manager ID: {token.given_by}
                  </p>
                  <p className="text-gray-600">
                    Status: <span className="text-red-600">Used</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
