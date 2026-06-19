"use client";

import { useState, useEffect } from "react";

export default function ManagePosts() {
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs`, {
        credentials: "include",
      });
      const data = await response.json();
      setJobs(data.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleEdit = (job) => {
    setEditingJob({
      ...job,
      postDate: job.postDate ? new Date(job.postDate).toISOString().split('T')[0] : '',
      deadlineDate: job.deadlineDate ? new Date(job.deadlineDate).toISOString().split('T')[0] : ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingJob(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
  
    try {
      const formData = new FormData();
      const { _id, __v, photo, createdAt, updatedAt, ...jobData } = editingJob; // Exclude unwanted fields
  
      // Convert dates to ISO format for consistency
      const updatedJobData = {
        ...jobData,
        postDate: jobData.postDate ? new Date(jobData.postDate).toISOString() : '',
        deadlineDate: jobData.deadlineDate ? new Date(jobData.deadlineDate).toISOString() : ''
      };
  
      // Append all fields to formData
      Object.entries(updatedJobData).forEach(([key, value]) => {
        formData.append(key, value || '');
      });
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs/${_id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
  
      if (response.ok) {
        const updatedJob = await response.json();
        setJobs(jobs.map(job => job._id === _id ? updatedJob.data : job));
        alert("Job updated successfully!");
        setEditingJob(null);
        fetchJobs(); // Refresh the job list
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating job:", error);
      alert("An error occurred while updating the job.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (response.ok) {
          alert("Job deleted successfully!");
          fetchJobs();
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("An error occurred while deleting the job.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mt-19">Manage Job Posts</h1>
        </div>

        {editingJob ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">Edit Job Post</h2>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={editingJob.fullName || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hiring Manager Email</label>
                  <input
                    type="email"
                    name="hiringManagerEmail"
                    value={editingJob.hiringManagerEmail || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    name="jobPostTitle"
                    value={editingJob.jobPostTitle || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={editingJob.companyName || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <input
                    type="text"
                    name="jobDepartment"
                    value={editingJob.jobDepartment || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    name="jobLocation"
                    value={editingJob.jobLocation || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                  <select
                    name="jobType"
                    value={editingJob.jobType || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                    required
                  >
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="text"
                    name="jobSalary"
                    value={editingJob.jobSalary || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Post Date *</label>
                  <input
                    type="date"
                    name="postDate"
                    value={editingJob.postDate || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline Date *</label>
                  <input
                    type="date"
                    name="deadlineDate"
                    value={editingJob.deadlineDate || ''}
                    min={editingJob.postDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                <textarea
                  name="shortJobDescription"
                  value={editingJob.shortJobDescription || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
                <textarea
                  name="jobDescription"
                  value={editingJob.jobDescription || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-2 focus:border-blue-600 transition-all outline-none"
                  rows="5"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Job
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">Your Job Listings</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job._id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-3 md:mb-0">
                        <h3 className="font-semibold text-gray-800">{job.jobPostTitle}</h3>
                        <div className="flex flex-wrap items-center mt-1 text-sm text-gray-600 gap-x-4 gap-y-1">
                          <span>{job.companyName}</span>
                          <span>•</span>
                          <span>{job.jobLocation}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {job.jobType}
                          </span>
                          <span>•</span>
                          <span>Posted: {new Date(job.postDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Deadline: {new Date(job.deadlineDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(job)}
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">You haven't posted any jobs yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}