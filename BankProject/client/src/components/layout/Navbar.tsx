import { Link } from 'react-router-dom';
import { ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className="main-navbar">
      <div className="nav-container">
        {/* Brand / Logo */}
        <Link to={user ? "/dashboard" : "/login"} className="brand-logo">
          <ShieldCheck className="logo-icon" size={26} />
          <span>SafeBank</span>
        </Link>

        {/* Dynamic User Section (Shows only when logged in) */}
        {user && (
          <div className="nav-links">
            <div className="user-section">
              <div className="user-info">
                <UserIcon size={16} />
                <span className="user-email">{user.email}</span>
              </div>
              <button onClick={onLogout} className="logout-btn">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}