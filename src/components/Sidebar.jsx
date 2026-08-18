import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  ReceiptText,
  Banknote,
  BookOpen,
  BarChart3,
  Globe,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("mandalLoggedIn");
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "वर्गणीदार",
      path: "/members",
      icon: Users,
    },
    {
      label: "जमा रक्कम",
      path: "/collections",
      icon: Wallet,
    },
    {
      label: "पावत्या",
      path: "/receipts",
      icon: ReceiptText,
    },
    {
      label: "खर्च",
      path: "/expenses",
      icon: Banknote,
    },
    {
      label: "Ledger",
      path: "/ledger",
      icon: BookOpen,
    },
    {
      label: "Reports",
      path: "/reports",
      icon: BarChart3,
    },
    {
      label: "Transparency",
      path: "/transparency",
      icon: Globe,
    },
  ];

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="logo">

        <div className="logo-icon">
          🙏
        </div>

        <div>
          <h2>Mandal Hishob</h2>
          <span>Digital Accounting</span>
        </div>

      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        <button
          className="logout-link"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;