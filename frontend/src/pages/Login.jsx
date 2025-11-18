import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

const Login = ({ modalSwitch }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const body = new URLSearchParams();
      body.append("username", values.email);
      body.append("password", values.password);

      const response = await fetch("http://localhost:8000/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Login failed");
        return;
      }

      login(data.access_token, { email: values.email });
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#18181B] rounded-xl shadow-lg shadow-black-700 p-8 w-[360px] md:w-[400px] px-10">
      <h2 className="text-white text-2xl font-semibold mb-4">Log in</h2>

      <Formik initialValues={{ email: "", password: "" }} validationSchema={LoginSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form>
            {/* Email */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Email</label>
              <Field
                name="email"
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg bg-transparent border border-gray-500 text-white"
              />
              <ErrorMessage name="email" className="text-red-400 text-xs" component="div" />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Password</label>
              <div className="relative">
                <Field
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 rounded-lg bg-transparent border border-gray-500 text-white"
                />

                <span
                  className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              <ErrorMessage name="password" className="text-red-400 text-xs" component="div" />
            </div>

            {/* Login Button */}
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white rounded-lg py-2">
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </Form>
        )}
      </Formik>

      <div className="text-center text-gray-400 text-sm mt-4">
        Don't have an account?{" "}
        <span onClick={modalSwitch} className="text-gray-200 underline cursor-pointer">
          Sign up
        </span>
      </div>
    </div>
  );
};

export default Login;
