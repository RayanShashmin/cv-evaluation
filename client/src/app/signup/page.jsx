"use client";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

function SignupForm() {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "candidate", // Default role
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // ✅ NEW: pre-select role from URL (?role=candidate|recruiter)
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "candidate" || roleParam === "recruiter") {
      setData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`;
      await axios.post(url, data);

      // Auto-login after successful signup
      await login(data.email, data.password);

      // ✅ NEW: optional redirect support
      const redirect = searchParams.get("redirect");

      setTimeout(() => {
        if (redirect) {
          router.push(redirect);
        } else {
          // Existing role-based redirect (unchanged behavior)
          if (data.role === "recruiter") {
            router.push("/dashboard");
          } else {
            router.push("/candidate/dashboard");
          }
        }
      }, 100);
    } catch (error) {
      if (error.response?.status >= 400 && error.response?.status <= 500) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred during signup");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/3.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="flex w-[900px] h-[650px] bg-white rounded-2xl shadow-lg">
        <div className="flex-1 flex items-center justify-center rounded-l-2xl">
          <img src="/15.jpg" alt="3D Illustration" className="w-3/4 h-auto" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign Up</h1>
          <p className="text-gray-500 text-sm mb-6">
            Create your account to get started with our platform.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              onChange={handleChange}
              value={data.firstName}
              required
              className="w-80 p-3 mb-4 bg-gray-100 placeholder-gray-500 rounded-lg outline-none border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-gray-600"
            />

            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              onChange={handleChange}
              value={data.lastName}
              required
              className="w-80 p-3 mb-4 bg-gray-100 placeholder-gray-500 rounded-lg outline-none border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-gray-600"
            />

            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={data.email}
              required
              className="w-80 p-3 mb-4 bg-gray-100 placeholder-gray-500 rounded-lg outline-none border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-gray-600"
            />

            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
              value={data.password}
              required
              className="w-80 p-3 mb-4 bg-gray-100 placeholder-gray-500 rounded-lg outline-none border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-gray-600"
            />

            {/* Role Selection — UI UNCHANGED */}
            <div className="w-80 mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                I am a:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="candidate"
                    checked={data.role === "candidate"}
                    onChange={handleChange}
                    className="mr-2 w-4 h-4 text-indigo-600"
                  />
                  <span className="text-gray-700">Candidate</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="recruiter"
                    checked={data.role === "recruiter"}
                    onChange={handleChange}
                    className="mr-2 w-4 h-4 text-indigo-600"
                  />
                  <span className="text-gray-700">Recruiter</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="w-80 p-3 bg-red-500 text-white text-center rounded-lg mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-80 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
