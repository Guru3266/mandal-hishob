import {
  NavLink,
  Outlet,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

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
  Menu,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { isAdmin } from "../utils/permissions";

import useMandalConfig
  from "../hooks/useMandalConfig";


import "../App.css";

function DashboardLayout() {
  const navigate = useNavigate();

  const admin = isAdmin();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ============================================================
  // AUTH STATE
  // ============================================================

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ============================================================
  // MANDAL CONFIG
  // ============================================================

  const mandalConfig = useMandalConfig();

  // ============================================================
  // CHECK SUPABASE SESSION
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Session error:",
            error
          );

          if (mounted) {
            setSession(null);
          }

          return;
        }

        if (mounted) {
          setSession(data?.session || null);
        }
      } catch (error) {
        console.error(
          "Auth check error:",
          error
        );

        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    checkSession();

    // ==========================================================
    // AUTH STATE LISTENER
    // ==========================================================

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log(
          "Auth event:",
          event
        );

        if (mounted) {
          setSession(
            currentSession || null
          );
        }

        // SIGNED OUT
        if (
          event === "SIGNED_OUT"
        ) {
          if (mounted) {
            setMobileMenuOpen(false);
          }

          navigate("/login", {
            replace: true,
          });
        }
      }
    );

    return () => {
      mounted = false;

      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    try {
      console.log(
        "Logout started..."
      );

      setMobileMenuOpen(false);

      const {
        error,
      } = await supabase.auth.signOut({
        scope: "global",
      });

      if (error) {
        console.error(
          "Supabase logout error:",
          error
        );

        alert(
          "Logout करताना समस्या आली."
        );

        return;
      }

      // Remove old temporary login
      localStorage.removeItem(
        "mandalLoggedIn"
      );

      console.log(
        "Logout successful"
      );

      // Extra safety
      setSession(null);

      navigate("/login", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      // Remove old login flag
      localStorage.removeItem(
        "mandalLoggedIn"
      );

      // Force login page
      window.location.replace(
        "/login"
      );
    }
  };

  // ============================================================
  // AUTH LOADING
  // ============================================================

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  // ============================================================
  // PROTECT DASHBOARD
  // ============================================================

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ============================================================
  // NAVIGATION CLASS
  // ============================================================

  const getNavClass = ({
    isActive,
  }) => {
    return `sidebar-link ${
      isActive
        ? "active"
        : ""
    }`;
  };

  // ============================================================
  // CLOSE MOBILE MENU
  // ============================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="app">

      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}
<div className="mobile-header">

  <div className="mobile-header-logo">
    <img
      src="/logo.png"
      alt="मंडळाचा लोगो"
    />
  </div>

  <div>
    <h2>
      {mandalConfig?.name || "मंडळाचे नाव"}
    </h2>

    <span>
      {mandalConfig?.tagline || "गणपती उत्सव 2026"}
    </span>
  </div>

  <button
    className="mobile-menu-button"
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  >
    ☰
  </button>

</div>
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`sidebar ${
          mobileMenuOpen
            ? "mobile-open"
            : ""
        }`}
      >

        {/* ====================================================
            LOGO
        ==================================================== */}

<div className="logo">

  <div className="logo-icon">
    <img
      src="/logo.png"
      alt="लक्ष्मी तरुण मित्र मंडळ"
    />
  </div>

  <div>
    <h2>
      {mandalConfig?.name || "मंडळाचे नाव"}
    </h2>

    <span>
      {mandalConfig?.tagline || "गणपती उत्सव 2026"}
    </span>
  </div>

</div>

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <nav className="sidebar-nav">

          <NavLink
            to="/dashboard"
            className={getNavClass}
            onClick={closeMobileMenu}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/members"
            className={getNavClass}
            onClick={closeMobileMenu}
          >
            <Users size={18} />
            <span>वर्गणीदार</span>
          </NavLink>

          <NavLink
            to="/collections"
            className={getNavClass}
            onClick={closeMobileMenu}
          >
            <WalletCards size={18} />
            <span>जमा रक्कम</span>
          </NavLink>

          <NavLink
            to="/receipts"
            className={getNavClass}
            onClick={closeMobileMenu}
          >
            <ReceiptText size={18} />
            <span>पावत्या</span>
          </NavLink>

          <NavLink
            to="/expenses"
            className={getNavClass}
            onClick={closeMobileMenu}
          >
            <Banknote size={18} />
            <span>खर्च</span>
          </NavLink>

          <NavLink
            to="/ledger"
            className={getNavClass}
            onClick={closeMobileMenu}
          >
            <BookOpen size={18} />
            <span>Ledger</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={getNavClass}
            onClick={closeMobileMenu}
          >
            <BarChart3 size={18} />
            <span>Reports</span>
          </NavLink>

          <NavLink
            to="/transparency"
            className={getNavClass}
            onClick={closeMobileMenu}
          >
            <Globe size={18} />
            <span>Transparency</span>
          </NavLink>

        </nav>

        {/* ====================================================
            BOTTOM
        ==================================================== */}

        <div className="sidebar-bottom">

         {admin && (
  <NavLink
    to="/settings"
    className={getNavClass}
    onClick={closeMobileMenu}
  >
    <Settings size={18} />
    <span>Settings</span>
  </NavLink>
)}

          {/* LOGOUT */}

          <button
            type="button"
            className="logout-link"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="main">
        <Outlet />
      </main>

    </div>
  );
}

export default DashboardLayout;