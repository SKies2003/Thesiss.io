import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SignupSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .min(8, "Min 8 chars")
    .matches(/[!@#$%^&*]/, "Must include special character")
    .required("Required"),
});

const Signup = ({ modalSwitch }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Signup failed");
        return;
      }

      login(data.access_token, data.user);
      toast.success("Account created!");
      navigate("/");
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#18181B] rounded-xl shadow-lg p-8 w-[360px] md:w-[400px] px-10">
      <h2 className="text-white text-2xl font-semibold mb-4">Create Account</h2>

      <Formik initialValues={{ email: "", password: "" }} validationSchema={SignupSchema} onSubmit={handleSubmit}>
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
                  placeholder="At least 8 characters"
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

            {/* Create Account Button */}
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white rounded-lg py-2">
              {isSubmitting ? "Creating..." : "Create account"}
            </button>
          </Form>
        )}
      </Formik>

      <div className="text-center text-gray-400 text-sm mt-4">
        Already have an account?{" "}
        <span onClick={modalSwitch} className="text-gray-200 underline cursor-pointer">
          Log in
        </span>
      </div>
    </div>
  );
};

export default Signup;
