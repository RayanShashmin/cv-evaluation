// client/src/components/EmailComposer.jsx - FIXED UI
"use client";
import { useState } from 'react';
import { X, Send, Loader2, Mail, User, FileText } from 'lucide-react';

export default function EmailComposer({ 
  isOpen, 
  onClose, 
  candidateEmail, 
  candidateName,
  onEmailSent 
}) {
  const [formData, setFormData] = useState({
    to: candidateEmail || '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.to || !formData.subject || !formData.message) {
      setError('Please fill in all fields');
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-email`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: formData.to,
            candidateName: candidateName || 'Candidate',
            subject: formData.subject,
            message: formData.message
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        // Success - notify parent and close
        if (onEmailSent) {
          onEmailSent(data);
        }
        
        // Reset form
        setFormData({
          to: candidateEmail || '',
          subject: '',
          message: ''
        });
        
        // Show success message
        alert('✅ Email sent successfully!');
        
        // Close modal
        onClose();
      } else {
        setError(data.message || 'Failed to send email');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(''); // Clear error when user types
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Message</h2>
              <p className="text-sm text-gray-500">Send personalized email to candidate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={sending}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* To Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                To
              </label>
              <input
                type="email"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="recipient@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 text-gray-700"
                required
                disabled={sending}
              />
              {candidateName && (
                <p className="mt-2 text-sm text-gray-500">
                  Sending to: <span className="font-medium text-gray-700">{candidateName}</span>
                </p>
              )}
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Regarding Your Application"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 text-gray-700"
                required
                disabled={sending}
              />
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-gray-50 font-sans text-gray-700"
                required
                disabled={sending}
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 Tip: Be professional and clear in your communication
              </p>
            </div>

            {/* Quick Templates */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Quick Templates:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    subject: 'Interview Invitation',
                    message: `Dear ${candidateName || 'Candidate'},\n\nWe were impressed with your application and would like to invite you for an interview.\n\nPlease let us know your availability for the coming week.\n\nBest regards`
                  }))}
                  className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  disabled={sending}
                >
                  📅 Interview Invitation
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    subject: 'Application Status Update',
                    message: `Dear ${candidateName || 'Candidate'},\n\nThank you for your application. We wanted to update you on the status of your application.\n\nYour application is currently under review and we will get back to you soon.\n\nBest regards`
                  }))}
                  className="px-4 py-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                  disabled={sending}
                >
                  📋 Status Update
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    subject: 'Additional Information Request',
                    message: `Dear ${candidateName || 'Candidate'},\n\nWe would like to request some additional information regarding your application.\n\nCould you please provide more details about your experience?\n\nBest regards`
                  }))}
                  className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                  disabled={sending}
                >
                  ℹ️ Info Request
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions - FIXED: Always visible */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-medium"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}