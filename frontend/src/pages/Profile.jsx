import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import Navbar from "../components/Navbar";

function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [toast, setToast] = useState(null);

  const { user: authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axiosClient.get("/user/stats");
      setData(res.data);
      if (res.data.user) {
        setProfileForm({
          firstName: res.data.user.firstName || "",
          lastName: res.data.user.lastName || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put("/user/updateProfile", profileForm);
      showToast("Profile updated successfully");
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || "Error updating profile", "error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put("/user/changePassword", passwordForm);
      showToast("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Error changing password", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user, stats, activity, recentSubmissions, bookmarks, solvedProblems } = data;
  const avatarLetter = user?.firstName?.charAt(0).toUpperCase() || "U";
  const memberSince = new Date(user?.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

  // Group solved problems by difficulty
  const groupedSolved = solvedProblems?.reduce((acc, prob) => {
    acc[prob.difficulty] = acc[prob.difficulty] || [];
    acc[prob.difficulty].push(prob);
    return acc;
  }, { easy: [], medium: [], hard: [] }) || { easy: [], medium: [], hard: [] };

  // Heatmap generation logic
  const renderHeatmap = () => {
    if (!activity) return null;
    
    // Sort dates
    const dates = Object.keys(activity).sort();
    if (dates.length === 0) return <div className="text-base-content/50">No activity data</div>;

    // A simplified heatmap for 182 days (26 weeks x 7 days)
    // To do it perfectly, we need to map to exact days of the week, but for UI sake, we can generate a simple grid.
    const weeks = [];
    let currentWeek = [];
    
    // Fill up to 182 cells to form a 26x7 grid (approx 6 months)
    for (let i = 0; i < 182; i++) {
      // Pick last 182 dates if available, or just mock missing days
      const dateStr = dates[dates.length - 182 + i] || null; 
      const count = dateStr ? (activity[dateStr] || 0) : 0;
      
      let colorClass = "fill-base-300";
      if (count === 1) colorClass = "fill-primary/40";
      else if (count === 2) colorClass = "fill-primary/70";
      else if (count >= 3) colorClass = "fill-primary";

      currentWeek.push(
        <rect
          key={`cell-${i}`}
          width="12"
          height="12"
          x={Math.floor(i / 7) * 16}
          y={(i % 7) * 16}
          className={`${colorClass} rx-2 ry-2 transition-all hover:stroke-accent hover:stroke-2 cursor-pointer`}
        >
          <title>{dateStr ? `${dateStr}: ${count} submissions` : "No activity"}</title>
        </rect>
      );

      if (currentWeek.length === 7) {
        weeks.push(<g key={`week-${weeks.length}`}>{currentWeek}</g>);
        currentWeek = [];
      }
    }

    return (
      <div className="overflow-x-auto pb-4">
        <svg width={26 * 16} height={7 * 16} className="mx-auto block">
          {weeks}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      
      {toast && (
        <div className="toast toast-top toast-end z-50 mt-16 animate-slide-up">
          <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'} shadow-lg text-white`}>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* User Info Card */}
        <div className="glass-card bg-base-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 border border-base-content/5 shadow-xl">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg ring-4 ring-primary/20">
            <span className="text-5xl font-bold text-primary-content">{avatarLetter}</span>
          </div>
          <div className="text-center md:text-left flex-1 space-y-2">
            <h1 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
            <p className="text-base-content/70">{user?.emailId}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
              <div className="badge badge-primary">{user?.role}</div>
              <div className="badge badge-outline">Member since {memberSince}</div>
              <div className="badge badge-accent badge-outline font-bold flex gap-1">
                🔥 Streak: {stats?.streak?.current || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card bg-base-100 p-6 rounded-2xl border border-base-content/5 text-center hover-glow transition-all">
            <div className="text-base-content/60 text-sm font-semibold mb-1">Total Solved</div>
            <div className="text-3xl font-bold text-primary">{stats?.totalSolved || 0}</div>
          </div>
          <div className="glass-card bg-base-100 p-6 rounded-2xl border border-base-content/5 text-center hover-glow transition-all">
            <div className="text-base-content/60 text-sm font-semibold mb-1">Acceptance Rate</div>
            <div className="text-3xl font-bold text-secondary">{stats?.acceptanceRate || 0}%</div>
          </div>
          <div className="glass-card bg-base-100 p-6 rounded-2xl border border-base-content/5 text-center hover-glow transition-all">
            <div className="text-base-content/60 text-sm font-semibold mb-1">Submissions</div>
            <div className="text-3xl font-bold text-info">{stats?.totalSubmissions || 0}</div>
          </div>
          <div className="glass-card bg-base-100 p-6 rounded-2xl border border-base-content/5 text-center hover-glow transition-all">
            <div className="text-base-content/60 text-sm font-semibold mb-1">Best Streak</div>
            <div className="text-3xl font-bold text-accent">🔥 {stats?.streak?.longest || 0}</div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="glass-card bg-base-100 p-6 rounded-2xl border border-base-content/5">
          <h2 className="text-xl font-bold mb-6">Activity (Last 6 Months)</h2>
          {renderHeatmap()}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Submissions */}
          <div className="glass-card bg-base-100 p-6 rounded-2xl border border-base-content/5">
            <h2 className="text-xl font-bold mb-4">Recent Submissions</h2>
            {recentSubmissions?.length === 0 ? (
              <p className="text-base-content/50 text-center py-4">No recent submissions</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Language</th>
                      <th>Runtime</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubmissions?.slice(0, 8).map((sub, idx) => (
                      <tr key={idx} className="hover:bg-base-200/50">
                        <td>
                          {sub.status === "Accepted" ? (
                            <span className="text-success font-bold text-sm">AC</span>
                          ) : (
                            <span className="text-error font-bold text-sm">{sub.status}</span>
                          )}
                        </td>
                        <td className="text-xs">{sub.language}</td>
                        <td className="text-xs font-mono">{sub.runtime ? `${sub.runtime}ms` : "-"}</td>
                        <td className="text-xs text-base-content/60">{new Date(sub.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Solved Problems */}
          <div className="glass-card bg-base-100 p-6 rounded-2xl border border-base-content/5">
            <h2 className="text-xl font-bold mb-4">Solved Problems</h2>
            <div className="space-y-4">
              {['easy', 'medium', 'hard'].map((diff) => (
                <div key={diff}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`capitalize text-sm font-bold ${
                      diff === 'easy' ? 'text-success' : diff === 'medium' ? 'text-warning' : 'text-error'
                    }`}>{diff}</span>
                    <span className="text-xs text-base-content/60">{groupedSolved[diff].length} problems</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {groupedSolved[diff].slice(0, 10).map((p, idx) => (
                      <NavLink 
                        key={idx} 
                        to={`/problem/${p.problemId || p._id}`} 
                        className="badge badge-outline hover:bg-base-300 transition-colors"
                      >
                        {p.title}
                      </NavLink>
                    ))}
                    {groupedSolved[diff].length > 10 && (
                      <span className="badge badge-ghost">+{groupedSolved[diff].length - 10} more</span>
                    )}
                    {groupedSolved[diff].length === 0 && (
                      <span className="text-xs text-base-content/40 italic">No {diff} problems solved yet.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bookmarks */}
        <div className="glass-card bg-base-100 p-6 rounded-2xl border border-base-content/5">
          <h2 className="text-xl font-bold mb-4">Bookmarked Problems</h2>
          {bookmarks?.length === 0 ? (
            <p className="text-base-content/50 text-center py-4">No bookmarks yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks?.map((b, idx) => (
                <NavLink 
                  key={idx} 
                  to={`/problem/${b.problemId || b._id}`}
                  className="bg-base-200 p-4 rounded-xl border border-base-content/5 hover:border-primary/50 transition-all flex justify-between items-center group"
                >
                  <span className="font-semibold truncate pr-2 group-hover:text-primary transition-colors">{b.title}</span>
                  <span className={`badge badge-sm ${
                    b.difficulty === 'easy' ? 'badge-success' : b.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                  }`}>{b.difficulty}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="glass-card bg-base-100 p-6 rounded-2xl border border-base-content/5 mb-10">
          <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Update Profile */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <h3 className="font-semibold text-lg border-b border-base-content/10 pb-2">Update Info</h3>
              <div className="form-control">
                <label className="label"><span className="label-text">First Name</span></label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Last Name</span></label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">Save Changes</button>
            </form>

            {/* Change Password */}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h3 className="font-semibold text-lg border-b border-base-content/10 pb-2">Change Password</h3>
              <div className="form-control">
                <label className="label"><span className="label-text">Current Password</span></label>
                <input 
                  type="password" 
                  className="input input-bordered w-full" 
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">New Password</span></label>
                <input 
                  type="password" 
                  className="input input-bordered w-full" 
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="btn btn-secondary w-full">Update Password</button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
