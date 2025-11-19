// src/components/AuthModal.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import sideImage from "../assets/image 3.png"; // uses your image

const AuthModal = ({ onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return false;
    }
    if (!isLogin && form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
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

      if (isLogin) {
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

      login(
        data.access_token,
        data.user || { email: form.email } // /auth/me will refresh real user
      );

      toast.success(isLogin ? "Logged in successfully!" : "Account created!");
      onClose();
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 animate-fade">
      {/* Outer container */}
      <div className="w-full max-w-4xl bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] rounded-3xl border border-[#1e293b] shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col md:flex-row relative animate-pop">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-xl leading-none"
        >
          ✕
        </button>

        {/* LEFT: Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-[#020617] relative items-center justify-center p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1d4ed833,_transparent)] pointer-events-none" />

          <div className="relative">
            <img
              src={sideImage}
              alt="Wealth journey"
              className="max-h-[380px] w-auto drop-shadow-[0_26px_60px_rgba(0,0,0,0.9)]"
            />
            <div className="absolute -bottom-6 left-4 bg-[#020617e6] border border-[#1e293b] rounded-2xl px-4 py-3 text-xs text-gray-200 backdrop-blur">
              <div className="font-semibold text-sm text-white">
                Event-Driven Compounding
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                See how earnings, dividends & corporate actions shape long-term
                returns.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Auth card */}
        <div className="w-full md:w-1/2 bg-[#020617] px-6 sm:px-8 py-7 flex flex-col justify-center">
{/* Brand + Heading */}
<div className="mb-5">
  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">
    THESIS.IO
  </div>

  {isLogin ? (
    <>
      {/* LOGIN PAGE HEADER */}
      <div className="text-[12px] sm:text-sm text-slate-400 mb-1">
        Good to see you here
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-white">
        Welcome to Thesis.io
      </h2>
    </>
  ) : (
    <>
      {/* SIGNUP PAGE HEADER (unchanged) */}
      <h2 className="text-xl sm:text-2xl font-semibold text-white">
        Create your Thesis.io account
      </h2>

      <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
      Let’s get you set up
      </p>
    </>
  )}
</div>



          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-[#0f0f17] border border-[#2a2a33] rounded-full p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`px-5 py-2 text-sm rounded-full transition ${
                  isLogin
                    ? "bg-white text-black font-semibold"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                Log in
              </button>

              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`px-5 py-2 text-sm rounded-full transition ${
                  !isLogin
                    ? "bg-white text-black font-semibold"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                Sign up
              </button>
            </div>
          </div>


          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Email */}
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-slate-300">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-[11px] text-slate-400 hover:text-slate-200"
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
                  placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
                  className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3.5 py-2.5 pr-10 text-sm text-gray-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {!isLogin && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Use a strong password. You&apos;ll use this to log back in.
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-[#1e3a8a] text-white text-sm font-semibold py-2.5 rounded-lg shadow-[0_16px_40px_rgba(37,99,235,0.45)] transition"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Log in"
                : "Create account"}
            </button>
          </form>

          {/* Bottom switch link */}
          <div className="mt-4 text-[11px] text-slate-400">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-slate-100 underline underline-offset-2"
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
                  className="text-slate-100 underline underline-offset-2"
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

export default AuthModal;
