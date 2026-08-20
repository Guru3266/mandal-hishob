import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ============================================================
  // GET USER ROLE
  // ============================================================

  const getUserRole = async (userId) => {
    const {
      data: roleData,
      error: roleError,
    } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleError) {
      console.error(
        "Role fetch error:",
        roleError
      );

      return null;
    }

    return roleData?.role || "viewer";
  };

  // ============================================================
  // CHECK EXISTING SESSION
  // ============================================================

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          return;
        }

        const role = await getUserRole(
          session.user.id
        );

        if (!role) {
          await supabase.auth.signOut();

          localStorage.removeItem(
            "userRole"
          );

          return;
        }

        localStorage.setItem(
          "userRole",
          role
        );

        navigate("/dashboard", {
          replace: true,
        });

      } catch (error) {
        console.error(
          "Session check error:",
          error
        );
      }
    };

    checkSession();
  }, [navigate]);

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const cleanMobile = mobile
      .replace(/\D/g, "")
      .slice(0, 10);

    // --------------------------------------------------------
    // MOBILE VALIDATION
    // --------------------------------------------------------

    if (!cleanMobile) {
      alert(
        "कृपया Mobile Number भरा."
      );

      return;
    }

    if (cleanMobile.length !== 10) {
      alert(
        "कृपया 10 अंकी Mobile Number टाका."
      );

      return;
    }

    // --------------------------------------------------------
    // PASSWORD VALIDATION
    // --------------------------------------------------------

    if (!password) {
      alert(
        "कृपया Password भरा."
      );

      return;
    }

    setLoading(true);

    try {
      // --------------------------------------------------------
      // SUPABASE AUTH
      // Mobile → Internal Email
      // --------------------------------------------------------

      const email =
        `${cleanMobile}@mandalhishob.local`;

      const {
        data: authData,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      // --------------------------------------------------------
      // LOGIN ERROR
      // --------------------------------------------------------

      if (loginError) {
        console.error(
          "Login error:",
          loginError
        );

        alert(
          "Mobile Number किंवा Password चुकीचा आहे."
        );

        return;
      }

      // --------------------------------------------------------
      // GET LOGGED-IN USER
      // --------------------------------------------------------

      const user =
        authData?.user;

      if (!user) {
        alert(
          "User information मिळाली नाही."
        );

        await supabase.auth.signOut();

        return;
      }

      // --------------------------------------------------------
      // GET USER ROLE
      // --------------------------------------------------------

      const role =
        await getUserRole(user.id);

      // --------------------------------------------------------
      // ROLE NOT FOUND
      // --------------------------------------------------------

      if (!role) {
        console.error(
          "No role found for user:",
          user.id
        );

        alert(
          "या account ला access role दिलेला नाही. Admin शी संपर्क करा."
        );

        await supabase.auth.signOut();

        localStorage.removeItem(
          "userRole"
        );

        return;
      }

      // --------------------------------------------------------
      // SAVE ROLE
      // --------------------------------------------------------

      localStorage.setItem(
        "userRole",
        role
      );

      // Optional: save logged-in user ID
      localStorage.setItem(
        "userId",
        user.id
      );

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "Unexpected login error:",
        error
      );

      alert(
        "Login करताना समस्या आली. पुन्हा प्रयत्न करा."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="login-page">

      <div className="login-card">

        {/* LOGO */}

        <div className="login-logo">
          🙏
        </div>

        {/* TITLE */}

        <h1>
          Mandal Hishob
        </h1>

        <p className="login-subtitle">
          वर्गणीपासून पूर्ण हिशोबापर्यंत
        </p>

        <form
          onSubmit={handleLogin}
        >

          {/* ================================================== */}
          {/* MOBILE NUMBER */}
          {/* ================================================== */}

          <div className="input-group">

            <label>
              Mobile Number
            </label>

            <input
              type="tel"
              placeholder="Enter mobile number"
              value={mobile}
              maxLength={10}
              inputMode="numeric"
              autoComplete="username"
              disabled={loading}
              onChange={(event) => {
                setMobile(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                );
              }}
            />

          </div>

          {/* ================================================== */}
          {/* PASSWORD */}
          {/* ================================================== */}

          <div className="input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              autoComplete="current-password"
              disabled={loading}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
            />

          </div>

          {/* ================================================== */}
          {/* LOGIN BUTTON */}
          {/* ================================================== */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* FOOTER */}

        <p className="login-footer">
          © 2026 Mandal Hishob
        </p>

      </div>

    </div>
  );
}

export default Login;