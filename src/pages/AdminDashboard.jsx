import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("overview");
  const [verifications, setVerifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) { navigate("/dashboard"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, verData, repData, usersData] = await Promise.all([
        apiFetch({ endpoint: "/admin/stats" }),
        apiFetch({ endpoint: "/admin/verifications" }),
        apiFetch({ endpoint: "/admin/reports" }),
        apiFetch({ endpoint: "/admin/users" }),
      ]);
      setStats(statsData);
      setVerifications(verData);
      setReports(repData.reports || []);
      setUsers(usersData.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resolveVerification = async (userId, status) => {
    await apiFetch({ endpoint: `/admin/verifications/${userId}`, method: "PATCH", body: { status } });
    setVerifications((v) => v.filter((u) => u._id !== userId));
  };

  const resolveReport = async (id, status) => {
    await apiFetch({ endpoint: `/admin/reports/${id}`, method: "PATCH", body: { status } });
    setReports((r) => r.map((rep) => rep._id === id ? { ...rep, status } : rep));
  };

  const banUser = async (id, ban) => {
    await apiFetch({ endpoint: `/admin/users/${id}/ban`, method: "PATCH", body: { ban } });
    setUsers((u) => u.map((usr) => usr._id === id ? { ...usr, isBanned: ban } : usr));
  };

  if (loading) return <div className="p-8 text-center">Loading admin panel...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Users", value: stats.users },
            { label: "Properties", value: stats.properties },
            { label: "Bookings", value: stats.bookings },
            { label: "Open Reports", value: stats.openReports },
            { label: "Pending Verifications", value: stats.pendingVerifications },
            { label: "Escrow Pending", value: `$${stats.totalEscrowPending?.toFixed(2)}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-semibold text-blue-600">{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {["overview", "verifications", "reports", "users"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border-b-2 transition-colors ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t}
            {t === "verifications" && verifications.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{verifications.length}</span>}
          </button>
        ))}
      </div>

      {/* Verifications tab */}
      {tab === "verifications" && (
        <div className="space-y-4">
          {verifications.length === 0 && <p className="text-gray-500">No pending verifications.</p>}
          {verifications.map((u) => (
            <div key={u._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{u.firstName} {u.lastName}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                  <div className="text-sm mt-1"><span className="font-medium">Company:</span> {u.businessVerification?.companyName}</div>
                  <div className="text-sm"><span className="font-medium">VAT:</span> {u.businessVerification?.vat}</div>
                  <div className="text-sm"><span className="font-medium">Website:</span> {u.businessVerification?.websiteURL}</div>
                  {u.businessVerification?.idDocument && (
                    <a href={u.businessVerification.idDocument} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline mt-1 block">View ID Document</a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => resolveVerification(u._id, "verified")} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700">Approve</button>
                  <button onClick={() => resolveVerification(u._id, "rejected")} className="bg-red-600 text-white text-sm px-3 py-1.5 rounded hover:bg-red-700">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reports tab */}
      {tab === "reports" && (
        <div className="space-y-4">
          {reports.length === 0 && <p className="text-gray-500">No open reports.</p>}
          {reports.map((r) => (
            <div key={r._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium capitalize">{r.type} report — {r.reason}</div>
                  <div className="text-sm text-gray-500">By: {r.reporter?.email}</div>
                  {r.description && <div className="text-sm mt-1">{r.description}</div>}
                  <div className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                {r.status === "open" && (
                  <div className="flex gap-2">
                    <button onClick={() => resolveReport(r._id, "resolved")} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700">Resolve</button>
                    <button onClick={() => resolveReport(r._id, "dismissed")} className="bg-gray-400 text-white text-sm px-3 py-1.5 rounded hover:bg-gray-500">Dismiss</button>
                  </div>
                )}
                {r.status !== "open" && <span className="text-sm capitalize text-gray-400">{r.status}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Host</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{u.firstName} {u.lastName}</td>
                  <td className="py-2 text-gray-500">{u.email}</td>
                  <td className="py-2">{u.isHost ? "✓" : "—"}</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.isBanned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {u.isBanned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td className="py-2">
                    <button onClick={() => banUser(u._id, !u.isBanned)}
                      className={`text-xs px-2 py-1 rounded ${u.isBanned ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
