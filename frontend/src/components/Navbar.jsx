import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router';
import { logoutUser } from '../authSlice';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const avatarLetter = user?.firstName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <nav className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-xl border-b border-base-content/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group transition-all duration-300">
            <span className="text-2xl font-bold font-mono text-primary group-hover:scale-105 transition-transform duration-300">
              ⟨/⟩
            </span>
            <span className="text-xl font-bold gradient-text">LeetCode</span>
          </NavLink>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Admin link */}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `btn btn-ghost btn-sm text-sm font-medium transition-all duration-300 ${
                    isActive ? 'text-primary bg-primary/10' : 'text-base-content/70 hover:text-primary'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </NavLink>
            )}

            {/* User dropdown */}
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
                    <span className="font-semibold text-base-content">{user?.firstName || 'User'}</span>
                    <span className="text-xs text-base-content/50">{user?.emailId || ''}</span>
                  </div>
                </li>
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
  );
}

export default Navbar;
