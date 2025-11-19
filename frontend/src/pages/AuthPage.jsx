// src/pages/AuthPage.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signup"); // "login" | "signup"
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return false;
    }

    if (mode === "signup" && form.password.length < 8) {
      toast.error("Password should be at least 8 characters.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let res;
      let data;

      if (mode === "login") {
        const body = new URLSearchParams();
        body.append("username", form.email);
        body.append("password", form.password);

        res = await fetch("http://localhost:8000/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
      } else {
        res = await fetch("http://localhost:8000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Authentication failed.");
        return;
      }

      // For /auth/token backend returns only { access_token, token_type }
      // For /auth/register it returns { user, access_token, token_type }
      login(
        data.access_token,
        data.user || { email: form.email } // user will be refreshed from /auth/me
      );

      toast.success(
        mode === "login" ? "Logged in successfully!" : "Account created!"
      );
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for Google Login – assumes you add a backend /auth/google later
  const handleGoogleLogin = async () => {
    try {
      // SIMPLE VERSION:
      // Redirect to your backend Google OAuth endpoint (to be implemented)
      window.location.href = "http://localhost:8000/auth/google/login";
    } catch (err) {
      console.error(err);
      toast.error("Google login not configured yet.");
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-[#101014] flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-6xl bg-[#050509] rounded-3xl shadow-2xl border border-[#1f2937] overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT PANEL – Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#020617] via-[#020617] to-[#0b1220] relative items-center justify-center p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1d4ed822,_transparent)] pointer-events-none" />

          <div className="relative">
            <img
              src="/src/assets/image 3.png"
              alt="Investor illustration"
              className="max-h-[420px] w-auto drop-shadow-[0_32px_60px_rgba(0,0,0,0.9)]"
            />
            <div className="absolute -bottom-8 left-6 bg-[#020617cc] border border-[#1e293b] rounded-2xl px-4 py-3 text-xs text-gray-200 backdrop-blur">
              <div className="font-semibold text-sm text-white">
                Event-driven investing
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Track how milestones, earnings & dividends shape long-term
                compounding.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL – Auth Card */}
        <div className="w-full lg:w-1/2 bg-[#050509] px-7 sm:px-10 py-10 flex flex-col justify-center">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
              THESIS.IO
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
              {isLogin ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              {isLogin
                ? "Log in to analyze event-driven history and your wealth journey."
                : "Join Thesis.io to explore compounding around real company events."}
            </p>
          </div>

          {/* MODE TOGGLE */}
          <div className="inline-flex mb-6 rounded-full bg-[#020617] border border-[#111827] p-1 text-xs">
            <button
              onClick={() => setMode("login")}
              className={`px-4 py-1.5 rounded-full transition ${
                isLogin
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`px-4 py-1.5 rounded-full transition ${
                !isLogin
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* GOOGLE BUTTON */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#1f2937] bg-[#020617] text-sm text-gray-100 hover:bg-[#020617ee] transition mb-5"
          >
            {/* Simple Google "G" icon */}
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white">
              <span className="text-[13px] font-bold text-[#4285F4]">G</span>
            </span>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-[#1f2937]" />
            <span className="text-[11px] uppercase tracking-wide text-gray-500">
              or with email
            </span>
            <div className="h-px flex-1 bg-[#1f2937]" />
          </div>

          {/* EMAIL / PASSWORD FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-gray-300 mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-gray-300">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-[11px] text-gray-400 hover:text-gray-200"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3.5 py-2.5 pr-10 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-[11px] text-gray-500 mt-1">
                  Use at least 8 characters. You’ll be able to log in with this
                  email later.
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-[#1d3c8f] text-white text-sm font-semibold py-2.5 rounded-lg shadow-[0_14px_30px_rgba(37,99,235,0.35)] transition"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Log in"
                : "Create account"}
            </button>
          </form>

          {/* FOOTER SWITCH LINK */}
          <div className="mt-5 text-xs text-gray-400">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-gray-100 underline underline-offset-2"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-gray-100 underline underline-offset-2"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
