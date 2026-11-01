import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import Alert from "../../components/common/Alert";
import Field from "../../components/common/Field";
import Spinner from "../../components/common/Spinner";
import { loginUser } from "../../api/authApi";
import { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      return setError("Enter your email and password.");
    }

    setError("");
    setLoading(true);
    try {
      const { data } = await loginUser({ email: form.email.trim(), password: form.password });
      login(data); // GuestRoute redirects to the app once the user is set
    } catch (err) {
      setError(getErrorMessage(err, "Sign in failed. Please try again."));
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <header className="auth-card__header">
        <h1>Welcome back</h1>
        <p>Sign in to continue to your chats.</p>
      </header>

      <form className="stack stack--lg" onSubmit={handleSubmit} noValidate>
        {error && <Alert>{error}</Alert>}

        <Field
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update("email")}
          autoFocus
        />

        <Field
          id="password"
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Your password"
          value={form.password}
          onChange={update("password")}
          trailing={
            <button
              type="button"
              className="icon-btn icon-btn--sm"
              onClick={() => setShowPassword((show) => !show)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={loading}>
          {loading && <Spinner size={16} />}
          Sign in
        </button>
      </form>

      <p className="auth-card__footer">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
