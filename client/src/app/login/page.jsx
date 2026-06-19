"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

function LoginForm() {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();

  // Read message from URL
  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setInfoMessage(decodeURIComponent(message));
    }
  }, [searchParams]);

  // Handle role-based redirect after login
  useEffect(() => {
    if (!user) return;

    const redirect = searchParams.get("redirect");
    if (redirect) {
      router.push(redirect);
    } else if (user.role === "candidate") {
      router.push("/candidate/dashboard");
    } else {
      router.push("/dashboard");
    }
  }, [user, router, searchParams]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(data.email, data.password);
      // Redirect will be handled by useEffect above
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/3.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="flex w-[900px] h-[500px] bg-white rounded-2xl shadow-lg">
        <div className="flex-1 flex items-center justify-center rounded-l-2xl">
          <img src="/15.jpg" alt="3D Illustration" className="w-3/4 h-auto" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Log In</h1>
          <p className="text-gray-500 text-sm mb-6">
            Enter your email and password to log in to your account.
          </p>

          {/* OPTIONAL: info message (no UI change, same style area) */}
          {infoMessage && !error && (
            <div className="w-80 p-3 text-blue-600 text-center rounded-lg mb-4">
              {infoMessage}
            </div>
          )}

          <form className="flex flex-col items-center w-full" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={data.email}
              required
              className="w-80 p-3 bg-gray-100 rounded-lg mb-4 outline-none border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-gray-600"
            />

            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
              value={data.password}
              required
              className="w-80 p-3 bg-gray-100 rounded-lg mb-4 outline-none border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-gray-600"
            />

            {error && (
              <div className="w-80 p-3 text-red-500 text-center rounded-lg mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-80 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <span className="mr-2">Logging in...</span>
                  <div className="w-4 h-4 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-indigo-600 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
