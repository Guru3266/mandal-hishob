import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!mobile || !password) {
      alert("कृपया Mobile आणि Password भरा.");
      return;
    }

    // Temporary login
    // Supabase authentication आपण पुढे जोडणार आहोत.
    localStorage.setItem("mandalLoggedIn", "true");

    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          🙏
        </div>

        <h1>Mandal Hishob</h1>

        <p className="login-subtitle">
          वर्गणीपासून पूर्ण हिशोबापर्यंत
        </p>

        <form onSubmit={handleLogin}>

          <div className="input-group">
            <label>Mobile Number</label>

            <input
              type="tel"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button">
            Login
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