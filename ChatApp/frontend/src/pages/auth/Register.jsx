import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

import Alert from "../../components/common/Alert";
import Field from "../../components/common/Field";
import Spinner from "../../components/common/Spinner";
import { registerUser } from "../../api/authApi";
import { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

const Register = () => {
  const { login } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return setError("Please fill in all fields.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setError("");
    setLoading(true);
    try {
      const { data } = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      login(data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create your account. Please try again."));
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <header className="auth-card__header">
        <h1>Create your account</h1>
        <p>It only takes a moment to get started.</p>
      </header>

      <form className="stack stack--lg" onSubmit={handleSubmit} noValidate>
        {error && <Alert>{error}</Alert>}

        <Field
          id="name"
          label="Name"
          icon={User}
          autoComplete="name"
          placeholder="Your name"
          maxLength={50}
          value={form.name}
          onChange={update("name")}
          autoFocus
        />

        <Field
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update("email")}
        />

        <Field
          id="password"
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 6 characters"
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
          Create account
        </button>
      </form>

      <p className="auth-card__footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
