// client/src/app/components/Header.jsx - UPDATED WITH PROFILE
"use client";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { Open_Sans } from "next/font/google";
import { useEffect, useState } from "react";
import { User, Briefcase } from "lucide-react";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
});

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handlePostJobClick = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/post-job&message=Please log in as a recruiter to post jobs");
      return;
    }

    // Check if user is recruiter
    if (user?.role === 'recruiter') {
      router.push("/post-job");
    } else {
      // Candidate trying to post job
      router.push("/recruiter-required");
    }
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/profile&message=Please log in to view your profile");
      return;
    }

    // Route based on role
    if (user?.role === 'candidate') {
      router.push("/candidate/dashboard");
    } else if (user?.role === 'recruiter') {
      router.push("/dashboard");
    }
  };

  const handleSignInClick = () => {
    if (isAuthenticated) {
      logout();
      router.push("/");
    } else {
      router.push("/login");
    }
  };

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div
      className={`fixed top-4 right-8 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${openSans.variable} font-sans`}
    >
      <div className="flex items-center bg-white/80 backdrop-blur-md shadow-md px-6 py-3 rounded-full gap-8">
        {/* Navigation Links */}
        <div className="flex gap-6 items-center">
          <Link
            href="/"
            className="text-base font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/jobs"
            className="text-base font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Jobs
          </Link>
          <Link
            href="/about"
            className="text-base font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            About
          </Link>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300"></div>

        {/* Action Buttons */}
        <div className="flex gap-3 items-center">
          {/* My Profile Button */}
          <button
            onClick={handleProfileClick}
            className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            {isAuthenticated ? 'My Profile' : 'Profile'}
          </button>

          {/* Post a Job Button */}
          <button
            onClick={handlePostJobClick}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            Post a Job
          </button>

          {/* Login/Logout Button */}
          <button
            onClick={handleSignInClick}
            className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
          >
            {isAuthenticated ? "Log out" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}