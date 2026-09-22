import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, promoteToAdmin } from "../authSlice";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passcode, setPasscode] = useState("admin123");
  const [modalError, setModalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    setLoading(true);
    setModalError("");
    const result = await dispatch(promoteToAdmin(passcode));
    setLoading(false);
    if (promoteToAdmin.fulfilled.match(result)) {
      setShowAdminModal(false);
      navigate("/admin");
    } else {
      setModalError(result.payload || "Invalid Admin passcode! Use 'admin123'.");
    }
  };

  const avatarLetter = user?.firstName?.charAt(0)?.toUpperCase() || "U";
  const isAdmin = user?.role === "admin";

  return (
    <>
      <nav className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-xl border-b border-base-content/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 group transition-all duration-300">
              <span className="text-2xl font-bold font-mono text-primary group-hover:scale-105 transition-transform duration-300">
                ⟨/⟩
              </span>
              <span className="text-xl font-bold gradient-text">SolveIt</span>
            </NavLink>

            {/* Center Nav */}
            <div className="hidden sm:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `btn btn-ghost btn-sm rounded-lg transition-all duration-300 ${
                    isActive ? "bg-primary/10 text-primary" : "text-base-content/70 hover:text-base-content"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/problems"
                className={({ isActive }) =>
                  `btn btn-ghost btn-sm rounded-lg transition-all duration-300 ${
                    isActive ? "bg-primary/10 text-primary" : "text-base-content/70 hover:text-base-content"
                  }`
                }
              >
                Problems
              </NavLink>
              {isAdmin ? (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `btn btn-ghost btn-sm rounded-lg transition-all duration-300 ${
                      isActive ? "bg-secondary/10 text-secondary font-semibold" : "text-secondary hover:bg-secondary/10"
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Panel
                </NavLink>
              ) : (
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="btn btn-outline btn-secondary btn-xs sm:btn-sm gap-1 rounded-lg ml-2"
                >
                  <span>🛡️</span> Enable Admin Mode
                </button>
              )}
            </div>

            {/* User dropdown */}
            <div className="flex items-center gap-3">
              {isAdmin && (
                <span className="badge badge-secondary badge-outline text-xs px-2.5 py-1 font-semibold">
                  ADMIN
                </span>
              )}
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar transition-all duration-300 hover:ring-2 hover:ring-primary/30"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-content">{avatarLetter}</span>
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] p-3 shadow-xl menu menu-sm dropdown-content glass-card rounded-xl w-56 space-y-1"
                >
                  <li className="px-3 py-2 border-b border-base-content/10 mb-1">
                    <div className="flex flex-col gap-0.5 pointer-events-none">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base-content">{user?.firstName || "User"}</span>
                        {isAdmin && <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded">ADMIN</span>}
                      </div>
                      <span className="text-xs text-base-content/50">{user?.emailId || ""}</span>
                    </div>
                  </li>

                  {/* Mobile nav links */}
                  <li className="sm:hidden">
                    <NavLink to="/" className="rounded-lg">Home</NavLink>
                  </li>
                  <li className="sm:hidden">
                    <NavLink to="/problems" className="rounded-lg">Problems</NavLink>
                  </li>
                  {isAdmin ? (
                    <li className="sm:hidden">
                      <NavLink to="/admin" className="rounded-lg font-semibold text-secondary">Admin Panel</NavLink>
                    </li>
                  ) : (
                    <li className="sm:hidden">
                      <button onClick={() => setShowAdminModal(true)} className="rounded-lg text-secondary">
                        🛡️ Enable Admin Mode
                      </button>
                    </li>
                  )}

                  {!isAdmin && (
                    <li>
                      <button onClick={() => setShowAdminModal(true)} className="text-secondary rounded-lg">
                        🛡️ Switch to Admin
                      </button>
                    </li>
                  )}

                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-error hover:bg-error/10 transition-all duration-300 rounded-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Passcode Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-base-content">
                <span>🛡️</span> Unlock Admin Privileges
              </h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-base-content/70 mb-4">
              Enter the Admin Passcode to upgrade your account to Admin role and unlock problem creation, updates, and seeding tools.
            </p>

            {modalError && (
              <div className="alert alert-error py-2 text-xs mb-4">
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handlePromote} className="space-y-4">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">Admin Passcode</span>
                  <span className="label-text-alt text-xs text-primary">Default: admin123</span>
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter admin passcode"
                  className="input input-bordered w-full bg-base-300/50 focus:input-secondary"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-secondary btn-sm gap-2"
                >
                  {loading ? <span className="loading loading-spinner loading-xs" /> : "Verify & Upgrade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
