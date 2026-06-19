"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ApplyNowPage() {
  const params = useParams();
  const jobId = params.jobId;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
  });
  const [resume, setResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobId) {
      const fetchJobDetails = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs/${jobId}`,
            {
              credentials: "include",
            }
          );
          const data = await response.json();
          setJob(data.data);
        } catch (error) {
          console.error("Error fetching job details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchJobDetails();
    }
  }, [jobId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Please upload PDF, DOC, or DOCX.");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }

      setResume(file);
      setError(null);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  try {
    // 1. Upload resume to S3 via Next.js API route
    let resumeUrl = "";
    if (resume) {
      const uploadFormData = new FormData();
      uploadFormData.append("file", resume);

      const uploadResponse = await fetch("/api/upload-resume", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Resume upload failed");
      }

      const uploadData = await uploadResponse.json();
      resumeUrl = uploadData.fileUrl;
    }

    // 2. Create FormData for backend with actual file
    const backendFormData = new FormData();
    backendFormData.append("name", formData.name);
    backendFormData.append("email", formData.email);
    backendFormData.append("phone", formData.phone);
    backendFormData.append("coverLetter", formData.coverLetter);
    backendFormData.append("jobId", jobId);
    backendFormData.append("resume", resume); // Attach the actual file

    // 3. Submit application to backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/applications`,
      {
        method: "POST",
        body: backendFormData, // Send as FormData (not JSON!)
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Application submission failed");
    }

    const result = await response.json();
    console.log("Application submitted successfully:", result);
    
    setSubmitSuccess(true);
  } catch (error) {
    console.error("Error submitting application:", error);
    setError(error.message || "An error occurred. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Job Not Found</h1>
          <p className="mt-2">
            The job you're looking for doesn't exist or may have been removed.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Other Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <svg
            className="w-16 h-16 text-green-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Application Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for applying to the {job.jobPostTitle} position at{" "}
            {job.companyName}. We'll review your application and get back to you
            soon.
          </p>
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Job Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Apply for {job.jobPostTitle}
          </h1>
          <p className="mt-2 text-lg text-gray-600">at {job.companyName}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="coverLetter"
                  className="block text-sm font-medium text-gray-700"
                >
                  Cover Letter *
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  rows="5"
                  required
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Explain why you're a good fit for this position..."
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="resume"
                  className="block text-sm font-medium text-gray-700"
                >
                  Resume/CV *
                </label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  required
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {resume && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected file: {resume.name} (
                    {(resume.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  PDF, DOC, or DOCX (Max. 5MB)
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              About the Position
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  {job.jobPostTitle}
                </h3>
                <p className="text-gray-600">{job.companyName}</p>
              </div>

              {job.shortJobDescription && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Job Summary
                  </h4>
                  <p className="mt-1 text-gray-600 whitespace-pre-line">
                    {job.shortJobDescription}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Location</h4>
                  <p className="mt-1 text-gray-600">{job.jobLocation}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Employment Type
                  </h4>
                  <p className="mt-1 text-gray-600">{job.jobType}</p>
                </div>
                {job.jobSalary && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Salary</h4>
                    <p className="mt-1 text-gray-600">{job.jobSalary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}