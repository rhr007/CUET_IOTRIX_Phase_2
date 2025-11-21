import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Swal from "sweetalert2";

export default function ManagerDashboard() {
  const [tokenValue, setTokenValue] = useState("");
  const [unusedTokens, setUnusedTokens] = useState([]);
  const [usedTokens, setUsedTokens] = useState([]);
  const [loadingUnused, setLoadingUnused] = useState(true);
  const [loadingUsed, setLoadingUsed] = useState(true);

  const managerId = localStorage.getItem("user_id"); // manager's id

  // Fetch unused tokens
  const fetchUnusedTokens = async () => {
    try {
      const res = await api.get("/manager/unused/token");
      setUnusedTokens(res.data);
      setLoadingUnused(false);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch unused tokens", "error");
      setLoadingUnused(false);
    }
  };

  // Fetch used tokens
  const fetchUsedTokens = async () => {
    try {
      const res = await api.get("/manager/used/token");
      setUsedTokens(res.data);
      setLoadingUsed(false);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch used tokens", "error");
      setLoadingUsed(false);
    }
  };

  useEffect(() => {
    fetchUnusedTokens();
    fetchUsedTokens();
  }, []);

  // Create a new token
  const handleCreateToken = async () => {
    if (!tokenValue) {
      Swal.fire("Error", "Please enter a token value", "error");
      return;
    }

    try {
      const res = await api.post(
        `/manager/create-token/${managerId}/${tokenValue}`
      );
      Swal.fire("Success", `Token created: ${res.data.token_value}`, "success");
      setTokenValue("");
      fetchUnusedTokens(); // refresh unused tokens
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.detail || "Failed to create token",
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
          Manager Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Create Token */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4">
            Create New Token
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              className="border p-3 rounded-lg flex-1 focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Enter token value"
              value={tokenValue}
              onChange={(e) => setTokenValue(e.target.value)}
            />
            <button
              onClick={handleCreateToken}
              className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-all cursor-pointer"
            >
              Create
            </button>
          </div>
        </div>

        {/* Unused Tokens */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4">
            Unused Tokens
          </h2>
          {loadingUnused ? (
            <p className="text-gray-500">Loading...</p>
          ) : unusedTokens.length === 0 ? (
            <p className="text-gray-500">No unused tokens</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unusedTokens.map((token) => (
                <div
                  key={token.id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <p className="font-semibold text-indigo-700">
                    Token: {token.token_value}
                  </p>
                  <p className="text-gray-600">
                    Created At: {new Date(token.created_at).toLocaleString()}
                  </p>
                  {/* <p className="text-gray-600">Given By: {token.given_by}</p> */}
                  <p className="text-gray-600">
                    Status: <span className="text-green-600">Unused</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Used Tokens */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4">
            Used Tokens
          </h2>
          {loadingUsed ? (
            <p className="text-gray-500">Loading...</p>
          ) : usedTokens.length === 0 ? (
            <p className="text-gray-500">No used tokens</p>
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
                    Created At: {new Date(token.created_at).toLocaleString()}
                  </p>
                  <p className="text-gray-600">Given By: {token.given_by}</p>
                  <p className="text-gray-600">
                    {/* {token.owned_by || "N/A"} at{" "} */}
                    Used at:
                    {token.used_at
                      ? new Date(token.used_at).toLocaleString()
                      : "N/A"}
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
