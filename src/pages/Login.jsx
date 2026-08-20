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
  // CHECK EXISTING SESSION
  // ============================================================

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate("/dashboard", {
          replace: true,
        });
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

    if (!password) {
      alert(
        "कृपया Password भरा."
      );
      return;
    }

    setLoading(true);

    try {
      // --------------------------------------------------------
      // Supabase Auth uses email/password.
      // We convert mobile into an internal email format.
      // --------------------------------------------------------

      const email =
        `${cleanMobile}@mandalhishob.local`;

      const {
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error(
          "Login error:",
          error
        );

        alert(
          "Mobile Number किंवा Password चुकीचा आहे."
        );

        return;
      }

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

        <div className="login-logo">
          🙏
        </div>

        <h1>
          Mandal Hishob
        </h1>

        <p className="login-subtitle">
          वर्गणीपासून पूर्ण हिशोबापर्यंत
        </p>

        <form
          onSubmit={handleLogin}
        >

          {/* MOBILE */}

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
              onChange={(event) => {
                setMobile(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                );
              }}
            />

          </div>

          {/* PASSWORD */}

          <div className="input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              autoComplete="current-password"
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
            />

          </div>

          {/* LOGIN */}

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

        <p className="login-footer">
          © 2026 Mandal Hishob
        </p>

      </div>

    </div>
  );
}

export default Login;