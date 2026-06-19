"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function JobCandidatesPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId;
  
  const [job, setJob] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('score');

  useEffect(() => {
    if (jobId) {
      fetchJobCandidates();
    }
  }, [jobId]);

  const fetchJobCandidates = async () => {
    try {
      const jobRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs/${jobId}`,
        { credentials: 'include' }
      );
      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJob(jobData.data);
      }

      const evalRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluations/job/${jobId}`,
        { credentials: 'include' }
      );
      
      if (evalRes.ok) {
        const evalData = await evalRes.json();
        setEvaluations(evalData.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getFitLevelStyle = (level) => {
    const styles = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      average: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
    };
    return styles[level] || styles.average;
  };

  const sortedEvaluations = [...evaluations].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.scores.overall - a.scores.overall;
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'name':
        return (a.extractedData.personalInfo.name || '').localeCompare(
          b.extractedData.personalInfo.name || ''
        );
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Job Not Found</h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {job.jobPostTitle}
            </h1>
            <p className="text-gray-600 mt-2">{job.companyName}</p>
            <p className="text-gray-500 mt-1">{job.jobLocation}</p>
            <div className="mt-4 flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {evaluations.length} {evaluations.length === 1 ? 'Candidate' : 'Candidates'}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">All Candidates</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="score">Highest Score</option>
                <option value="date">Most Recent</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {sortedEvaluations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No candidates have applied yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvaluations.map((evaluation) => {
              // FIX: Changed 'eval' to 'evaluation'
              const appId = typeof evaluation.applicationId === 'object' 
                ? (evaluation.applicationId._id || evaluation.applicationId.toString())
                : evaluation.applicationId;
              
              return (
                <div
                  key={evaluation._id}
                  onClick={() => router.push(`/evaluations/${appId}`)}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md cursor-pointer transition border-l-4 border-transparent hover:border-blue-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {evaluation.extractedData.personalInfo.name}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {evaluation.extractedData.personalInfo.email}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        📞 {evaluation.extractedData.personalInfo.phone} • 
                        📍 {evaluation.extractedData.personalInfo.location}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {evaluation.extractedData.skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {evaluation.extractedData.skills.length > 5 && (
                          <span className="px-2 py-1 text-gray-500 text-xs">
                            +{evaluation.extractedData.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-6 text-right space-y-2">
                      <div className={`px-6 py-3 rounded-lg font-bold text-2xl border-2 ${getScoreColor(evaluation.scores.overall)}`}>
                        {evaluation.scores.overall}
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getFitLevelStyle(evaluation.matchAnalysis.fitLevel)}`}>
                        {evaluation.matchAnalysis.fitLevel.toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(evaluation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Skills Match</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {evaluation.scores.skillsMatch}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {evaluation.scores.experienceLevel}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Education</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {evaluation.scores.educationFit}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Presentation</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {evaluation.scores.presentationQuality}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}