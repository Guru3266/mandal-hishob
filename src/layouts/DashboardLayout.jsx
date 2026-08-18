import {
  NavLink,
  Outlet,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  WalletCards,
  ReceiptText,
  Banknote,
  BookOpen,
  BarChart3,
  Globe,
  Settings,
  LogOut,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getMandalConfig,
} from "../utils/mandalConfig";

import "../App.css";


function DashboardLayout() {

  const navigate = useNavigate();


  /* =====================================================
     MANDAL CONFIG
  ===================================================== */

  const [
    mandalConfig,
    setMandalConfig,
  ] = useState(
    getMandalConfig()
  );


  /* =====================================================
     LOGIN CHECK
  ===================================================== */

  const isLoggedIn =
    localStorage.getItem(
      "mandalLoggedIn"
    ) === "true";


  /* =====================================================
     LISTEN FOR SETTINGS UPDATE
  ===================================================== */

  useEffect(() => {

    const updateConfig = () => {

      setMandalConfig(
        getMandalConfig()
      );

    };


    window.addEventListener(
      "mandalConfigUpdated",
      updateConfig
    );


    return () => {

      window.removeEventListener(
        "mandalConfigUpdated",
        updateConfig
      );

    };

  }, []);


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    localStorage.removeItem(
      "mandalLoggedIn"
    );

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  /* =====================================================
     PROTECT DASHBOARD
  ===================================================== */

  if (!isLoggedIn) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  /* =====================================================
     NAVIGATION CLASS
  ===================================================== */

  const getNavClass = ({
    isActive,
  }) => {

    return `sidebar-link ${
      isActive
        ? "active"
        : ""
    }`;

  };


  return (

    <div className="app">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">


        {/* =================================================
            LOGO
        ================================================= */}

        <div className="logo">

          <div className="logo-icon">
            🙏
          </div>


          <div>

            <h2>
              {mandalConfig.name}
            </h2>

            <span>
              {mandalConfig.tagline}
            </span>

          </div>

        </div>


        {/* =================================================
            MAIN NAVIGATION
        ================================================= */}

        <nav className="sidebar-nav">


          {/* DASHBOARD */}

          <NavLink
            to="/dashboard"
            className={getNavClass}
          >

            <LayoutDashboard
              size={18}
            />

            <span>
              Dashboard
            </span>

          </NavLink>


          {/* MEMBERS */}

          <NavLink
            to="/members"
            className={getNavClass}
          >

            <Users
              size={18}
            />

            <span>
              वर्गणीदार
            </span>

          </NavLink>


          {/* COLLECTIONS */}

          <NavLink
            to="/collections"
            className={getNavClass}
          >

            <WalletCards
              size={18}
            />

            <span>
              जमा रक्कम
            </span>

          </NavLink>


          {/* RECEIPTS */}

          <NavLink
            to="/receipts"
            className={getNavClass}
          >

            <ReceiptText
              size={18}
            />

            <span>
              पावत्या
            </span>

          </NavLink>


          {/* EXPENSES */}

          <NavLink
            to="/expenses"
            className={getNavClass}
          >

            <Banknote
              size={18}
            />

            <span>
              खर्च
            </span>

          </NavLink>


          {/* LEDGER */}

          <NavLink
            to="/ledger"
            className={getNavClass}
          >

            <BookOpen
              size={18}
            />

            <span>
              Ledger
            </span>

          </NavLink>


          {/* REPORTS */}

          <NavLink
            to="/reports"
            className={getNavClass}
          >

            <BarChart3
              size={18}
            />

            <span>
              Reports
            </span>

          </NavLink>


          {/* TRANSPARENCY */}

          <NavLink
            to="/transparency"
            className={getNavClass}
          >

            <Globe
              size={18}
            />

            <span>
              Transparency
            </span>

          </NavLink>

        </nav>


        {/* =================================================
            BOTTOM MENU
        ================================================= */}

        <div className="sidebar-bottom">


          {/* SETTINGS */}

          <NavLink
            to="/settings"
            className={getNavClass}
          >

            <Settings
              size={18}
            />

            <span>
              Settings
            </span>

          </NavLink>


          {/* LOGOUT */}

          <button
            type="button"
            className="logout-link"
            onClick={handleLogout}
          >

            <LogOut
              size={18}
            />

            <span>
              Logout
            </span>

          </button>


        </div>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main">

        <Outlet />

      </main>

    </div>

  );

}

export default DashboardLayout;