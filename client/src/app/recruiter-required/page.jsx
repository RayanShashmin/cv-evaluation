// client/src/app/recruiter-required/page.jsx
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { Briefcase, ArrowRight, Lock, UserCheck } from "lucide-react";

export default function RecruiterRequired() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSwitchToRecruiter = async () => {
    // Log out current user
    await logout();
    // Redirect to signup with recruiter role pre-selected
    router.push("/signup?role=recruiter");
  };

  const handleLoginAsRecruiter = async () => {
    // Log out current user
    await logout();
    // Redirect to login
    router.push("/login?message=Please log in with a recruiter account");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-10 py-16">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Recruiter Access Required
            </h1>
            <p className="text-indigo-100 text-lg">
              This section is exclusively for recruiters
            </p>
          </div>

          {/* Content Section */}
          <div className="px-8 py-10">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg mb-2">
                Hi <span className="font-semibold text-gray-900">{user?.firstName}</span>! 👋
              </p>
              <p className="text-gray-600">
                You're currently logged in as a <span className="font-semibold text-indigo-600">Candidate</span>.
              </p>
            </div>

            {/* Features Box */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                What Recruiters Can Do:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Post unlimited job openings</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Access AI-powered CV evaluation</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Manage applications and candidates</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Send automated feedback emails</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleSwitchToRecruiter}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                <UserCheck className="w-5 h-5" />
                Create Recruiter Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleLoginAsRecruiter}
                className="w-full px-6 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
              >
                Log in as Recruiter
              </button>

              <button
                onClick={() => router.push("/candidate/dashboard")}
                className="w-full px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Back to My Dashboard
              </button>
            </div>

            {/* Info Text */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Note: You can have separate accounts for recruiting and job searching
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}