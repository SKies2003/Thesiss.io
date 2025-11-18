import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const authenticate = async () => {
    if (!form.email || !form.password) {
      toast.error("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      let res, data;

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
        toast.error(data.detail || "Something went wrong.");
        setLoading(false);
        return;
      }

      login(data.access_token, data.user || { email: form.email });
      toast.success(mode === "login" ? "Logged in!" : "Account created!");

      setLoading(false);
      onClose();
      navigate("/");
    } catch {
      toast.error("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#18181B] p-8 rounded-xl w-[380px] shadow-2xl text-white animate-pop font-sans">

        {/* Header Tabs */}
        <div className="flex justify-between items-center mb-6">
          <button
            className={`px-4 py-2 text-base ${
              mode === "login" ? "text-blue-400" : "text-gray-400"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={`px-4 py-2 text-base ${
              mode === "signup" ? "text-blue-400" : "text-gray-400"
            }`}
            onClick={() => setMode("signup")}
          >
            Signup
          </button>

          <button className="text-gray-400 text-xl" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Email */}
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-[#2D2C2F] border border-gray-600 mb-3 font-sans"
        />

        {/* Password */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-[#2D2C2F] border border-gray-600 mb-6 font-sans"
        />

        {/* Button */}
        <button
          onClick={authenticate}
          disabled={loading}
          className="w-full bg-blue-600 py-3 rounded-lg text-white font-semibold hover:bg-blue-700 transition font-sans"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
