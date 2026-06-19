// client/src/app/evaluations/[applicationId]/page.jsx - COMPLETE VERSION
"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import EmailComposer from "@/app/components/EmailComposer";


export default function EvaluationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId;
  
  const [evaluation, setEvaluation] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('submitted');
  
  // Email composer state
  const [showEmailComposer, setShowEmailComposer] = useState(false);

  useEffect(() => {
    console.log('📌 Evaluation Page Loaded');
    console.log('   Params object:', params);
    console.log('   Application ID from URL:', applicationId);
    
    if (applicationId && applicationId !== 'undefined') {
      fetchData();
    } else {
      console.error('❌ Invalid applicationId:', applicationId);
      setError('Invalid application ID');
      setLoading(false);
    }
  }, [applicationId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching data for application:', applicationId);
      
      // Fetch evaluation
      const evalUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluations/${applicationId}`;
      console.log('📡 Fetching evaluation from:', evalUrl);
      
      const evalResponse = await fetch(evalUrl, { 
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('   Evaluation response status:', evalResponse.status);
      
      if (evalResponse.ok) {
        const evalData = await evalResponse.json();
        console.log('✅ Evaluation data received:', evalData);
        
        if (evalData.success && evalData.data) {
          setEvaluation(evalData.data);
        } else {
          console.warn('⚠️  Evaluation response missing data');
        }
      } else {
        const errorText = await evalResponse.text();
        console.log('⚠️  Evaluation fetch failed:', errorText);
      }

      // Fetch application details
      const appUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/applications/${applicationId}`;
      console.log('📡 Fetching application from:', appUrl);
      
      const appResponse = await fetch(appUrl, { 
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('   Application response status:', appResponse.status);
      
      if (appResponse.ok) {
        const appData = await appResponse.json();
        console.log('✅ Application data received:', appData);
        
        if (appData.success && appData.application) {
          setApplication(appData.application);
          setCurrentStatus(appData.application.status || 'submitted');
        } else if (appData.application) {
          setApplication(appData.application);
          setCurrentStatus(appData.application.status || 'submitted');
        } else {
          console.warn('⚠️  Application response missing data');
        }
      } else {
        const errorText = await appResponse.text();
        console.log('⚠️  Application fetch failed:', errorText);
      }

      // If we got neither evaluation nor application, show error
      if (!evalResponse.ok && !appResponse.ok) {
        setError('Could not load data. The evaluation or application may not exist.');
      }
      
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message || 'An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    
    if (!confirm(`Change status to "${newStatus}"?`)) {
      e.target.value = currentStatus;
      return;
    }

    setActionLoading(true);
    try {
      console.log('📝 Updating status to:', newStatus);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      const data = await response.json();
      console.log('   Status update response:', data);

      if (data.success || response.ok) {
        alert('✅ Status updated successfully!');
        setCurrentStatus(newStatus);
        fetchData(); // Refresh data
      } else {
        alert('❌ Failed to update status: ' + (data.message || 'Unknown error'));
        e.target.value = currentStatus;
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('❌ Error updating status');
      e.target.value = currentStatus;
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!confirm('Send feedback email to this candidate?')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluations/${applicationId}/send-feedback`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Feedback email sent successfully!');
        fetchData();
      } else {
        alert(`❌ Failed to send feedback: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error sending feedback:', error);
      alert('❌ Error sending feedback email');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!confirm('⚠️ Are you sure you want to delete this candidate?\n\nThis action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluations/${applicationId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Candidate deleted successfully');
        router.push('/dashboard');
      } else {
        alert(`❌ Failed to delete: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting candidate:', error);
      alert('❌ Error deleting candidate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmailSent = (data) => {
    console.log('✅ Email sent successfully:', data);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-blue-50';
    if (score >= 40) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getFitLevelBadge = (level) => {
    const styles = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      average: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
    };
    return styles[level] || styles.average;
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      reviewing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      shortlisted: 'bg-green-100 text-green-800 border-green-200',
      interviewed: 'bg-purple-100 text-purple-800 border-purple-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading evaluation...</p>
          <p className="mt-2 text-sm text-gray-500">Application ID: {applicationId}</p>
          <p className="mt-1 text-xs text-gray-400">
            Fetching from: {process.env.NEXT_PUBLIC_API_BASE_URL}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || (!evaluation && !application)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {error ? 'Error Loading Data' : 'Evaluation Not Found'}
          </h1>
          <p className="text-gray-600 mb-2">
            {error || 'No evaluation or application data available'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Application ID: {applicationId}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.back()}
              className="block w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              ← Go Back
            </button>
            <button
              onClick={() => fetchData()}
              className="block w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If we have application but no evaluation yet
  if (!evaluation && application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center font-medium"
          >
            ← Back to Dashboard
          </button>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-yellow-900 mb-2">
              Evaluation In Progress
            </h2>
            <p className="text-yellow-800 mb-4">
              The AI evaluation for this application is currently being processed.
            </p>
            <p className="text-sm text-yellow-700 mb-6">
              Application from: {application.name} ({application.email})
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => fetchData()}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-white border border-yellow-300 text-yellow-900 rounded-lg hover:bg-yellow-50"
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render with evaluation data
  const { extractedData, scores, feedback, matchAnalysis } = evaluation;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Email Composer Modal */}
      <EmailComposer
        isOpen={showEmailComposer}
        onClose={() => setShowEmailComposer(false)}
        candidateEmail={extractedData?.personalInfo?.email || application?.email}
        candidateName={extractedData?.personalInfo?.name || application?.name}
        onEmailSent={handleEmailSent}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center font-medium transition"
          >
            ← Back to Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {extractedData?.personalInfo?.name || application?.name || 'Unknown Name'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {extractedData?.personalInfo?.email || application?.email || 'Unknown Email'} 
                  {(extractedData?.personalInfo?.phone || application?.phone) && (
                    <> • {extractedData?.personalInfo?.phone || application?.phone}</>
                  )}
                </p>
                {extractedData?.personalInfo?.location && (
                  <p className="text-gray-500 text-sm mt-1">
                    📍 {extractedData.personalInfo.location}
                  </p>
                )}
              </div>
              
              <div className="text-right">
                <div className={`text-5xl font-bold ${getScoreColor(scores?.overall || 0)}`}>
                  {scores?.overall || '-'}
                </div>
                <p className="text-gray-600 text-sm mt-1">Overall Score</p>
                <span
                  className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold ${
                    getFitLevelBadge(matchAnalysis?.fitLevel || 'average')
                  }`}
                >
                  {(matchAnalysis?.fitLevel || 'average').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Status Update Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Status
                  </label>
                  <span className={`inline-flex px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusBadge(currentStatus)}`}>
                    {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Update Application Status
                  </label>
                  <select
                    value={currentStatus}
                    onChange={handleStatusChange}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="reviewing">Under Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    ℹ️ Changes will be visible to the candidate immediately
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3 pt-6 border-t border-gray-200">
              {/* Send Personalized Email Button */}
              <button
                onClick={() => setShowEmailComposer(true)}
                disabled={actionLoading}
                className={`px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/50 transition-all transform hover:scale-105 ${
                  actionLoading ? 'opacity-50 cursor-wait' : ''
                }`}
              >
                ✉️ Send Personalized Email
              </button>

              <button
                onClick={handleSendFeedback}
                disabled={actionLoading || evaluation.feedbackSent}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                  evaluation.feedbackSent
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                } ${actionLoading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {evaluation.feedbackSent ? (
                  <>
                    ✅ Feedback Sent
                    <span className="text-xs">
                      ({new Date(evaluation.feedbackSentAt).toLocaleDateString()})
                    </span>
                  </>
                ) : (
                  <>📧 Send AI Feedback</>
                )}
              </button>

              <button
                onClick={handleDeleteCandidate}
                disabled={actionLoading}
                className={`px-6 py-3 bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-red-700 hover:shadow-lg transition-all transform hover:scale-105 ${
                  actionLoading ? 'opacity-50 cursor-wait' : ''
                }`}
              >
                🗑️ Delete Candidate
              </button>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(scores || {})
            .filter(([key]) => key !== 'overall')
            .map(([key, value]) => (
              <div key={key} className={`${getScoreBgColor(value || 0)} rounded-lg p-6 shadow-sm border border-gray-200`}>
                <h3 className="text-gray-700 text-sm font-medium uppercase mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className={`text-4xl font-bold ${getScoreColor(value || 0)}`}>
                  {value || '-'}
                </div>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      (value || 0) >= 80 ? 'bg-green-500' :
                      (value || 0) >= 60 ? 'bg-blue-500' :
                      (value || 0) >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${value || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
        </div>

        {/* Summary */}
        {extractedData?.summary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed">
              {extractedData.summary}
            </p>
          </div>
        )}

        {/* Skills & Match Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Skills */}
          {extractedData?.skills && extractedData.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔧 Skills</h2>
              <div className="flex flex-wrap gap-2">
                {extractedData.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Match Analysis */}
          {matchAnalysis && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Skills Match</h2>
              <div className="space-y-4">
                {matchAnalysis.matchedSkills && matchAnalysis.matchedSkills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-green-700 mb-2">✓ Matched Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {matchAnalysis.matchedSkills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {matchAnalysis.missingSkills && matchAnalysis.missingSkills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-red-700 mb-2">✗ Missing Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {matchAnalysis.missingSkills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Experience */}
        {extractedData?.experience && extractedData.experience.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💼 Experience</h2>
            <div className="space-y-6">
              {extractedData.experience.map((exp, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {exp.title || 'Unknown Title'}
                  </h3>
                  <p className="text-gray-600">{exp.company || 'Unknown Company'}</p>
                  <p className="text-sm text-gray-500">{exp.duration || 'N/A'}</p>
                  {exp.description && (
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {extractedData?.education && extractedData.education.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎓 Education</h2>
            <div className="space-y-4">
              {extractedData.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {edu.degree || 'Unknown Degree'}
                  </h3>
                  <p className="text-gray-600">{edu.institution || 'Unknown Institution'}</p>
                  <p className="text-sm text-gray-500">
                    {edu.year || 'N/A'} • {edu.field || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {extractedData?.certifications && extractedData.certifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🏆 Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {extractedData.certifications.map((cert, index) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {feedback.strengths && feedback.strengths.length > 0 && (
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold text-green-900 mb-4">💪 Strengths</h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((item, index) => (
                    <li key={index} className="text-green-800 text-sm">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.weaknesses && feedback.weaknesses.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="text-xl font-bold text-yellow-900 mb-4">⚠️ Areas to Improve</h3>
                <ul className="space-y-2">
                  {feedback.weaknesses.map((item, index) => (
                    <li key={index} className="text-yellow-800 text-sm">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.recommendations && feedback.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4">💡 Recommendations</h3>
                <ul className="space-y-2">
                  {feedback.recommendations.map((item, index) => (
                    <li key={index} className="text-blue-800 text-sm">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* AI Summary */}
        {(feedback?.summary || matchAnalysis?.experienceGap) && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white mb-8">
            <h2 className="text-2xl font-bold mb-4">🤖 AI Assessment</h2>
            {feedback?.summary && (
              <p className="text-lg leading-relaxed mb-4">{feedback.summary}</p>
            )}
            {matchAnalysis?.experienceGap && (
              <div className="p-4 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-semibold mb-2">Experience Gap Analysis:</p>
                <p className="text-sm">{matchAnalysis.experienceGap}</p>
              </div>
            )}
          </div>
        )}

        {/* Processing Info */}
        <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-600 border border-gray-200">
          <p>
            Evaluation completed in {evaluation?.processingTime ? (evaluation.processingTime / 1000).toFixed(1) : '0.0'} seconds
            {evaluation?.createdAt && (
              <> • Processed on {new Date(evaluation.createdAt).toLocaleDateString()}</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}