import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
<<<<<<< Updated upstream
    // Replace with your API call
    toast.success("Login successful!");
    setSubmitting(false);
=======
    try {
      const body = new URLSearchParams();
      body.append("username", values.email);
      body.append("password", values.password);

      const response = await fetch("http://localhost:8000/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Login failed:', error);
        toast.error(error.detail || "Login failed");
        setSubmitting(false);
        return;
      }

      const data = await response.json();
      console.log('Login successful, token received:', data.access_token ? 'Yes' : 'No');
      
      // Store token in localStorage
      localStorage.setItem('token', data.access_token);
      const userRes = await fetch("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      
      if (!userRes.ok) {
        console.error('Failed to fetch user data:', await userRes.text());
        toast.error("Failed to get user information");
        setSubmitting(false);
        return;
      }
      
      const userData = await userRes.json();
      console.log('User data received:', userData);

      login(data.access_token, userData);
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      console.error('Login error details:', err);
      toast.error(`Login error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
>>>>>>> Stashed changes
  };

  return (
    <div className="min-h-screen bg-[#232323] flex flex-col justify-center items-center">
      <div className="flex flex-col md:flex-row items-center justify-center gap-35 py-10">
        {/* Left Illustration (optional) */}
        <div className="hidden md:block">
          <img
            src="/src/assets/image 3.png"
            alt="Finance Illustration"
            className="max-w-md"
          />
        </div>
        {/* Auth Card */}
        <div className="bg-[#18181B] rounded-xl shadow-lg shadow-black-700 p-8 w-[360px] md:w-[400px] px-10">
          <h2 className="text-white text-2xl font-semibold mb-4">
            Log in to your account
          </h2>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                {/* Email */}
                <div className="mb-4">
                  <label className="block text-gray-400 mb-1 text-sm">Email</label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="balamia@gmail.com"
                    className="w-full px-4 py-2 rounded-lg bg-transparent border border-gray-500 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.5)] transition-shadow"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-400 text-xs mt-1"
                  />
                </div>
                {/* Password */}
                <div className="mb-4">
                  <label className="block text-gray-400 mb-1 text-sm">Password</label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full px-4 py-2 rounded-lg bg-transparent border border-gray-500 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.5)] transition-shadow"
                    />
                    <span
                      className="absolute right-3 top-2.5 text-gray-400 cursor-pointer select-none"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </span>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-400 text-xs mt-1"
                  />
                  <div className="text-right mt-1">
                    <button
                      type="button"
                      className="text-gray-200 text-xs hover:underline cursor-pointer"
                      tabIndex={-1}
                    >
                      Forgot?
                    </button>
                  </div>
                </div>
                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold mt-3 mb-3 hover:bg-blue-700"
                >
                  {isSubmitting ? "Logging in..." : "Log in"}
                </button>
              </Form>
            )}
          </Formik>
          <div className="flex justify-center">
            <span className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-gray-200 hover:underline cursor-pointer">
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
