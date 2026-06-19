import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, X, Send, Sparkles, Bot, User, 
  Loader2, Zap, TrendingUp, Lightbulb, RefreshCw 
} from "lucide-react";

export default function RecruitmentChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hey there! I'm your AI recruitment assistant. I'm here to help you find jobs, improve your CV, ace interviews, and navigate our platform. What can I help you with today?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      if (suggestions.length === 0) {
        fetchSuggestions();
      }
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chatbot/suggestions`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const sendMessage = async (messageText) => {
    const message = messageText || inputMessage;
    if (!message.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setShowSuggestions(false);
    
    // Show typing indicator
    setTimeout(() => setIsTyping(true), 300);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: conversationHistory,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Simulate typing delay for better UX
        setTimeout(() => {
          setIsTyping(false);
          const botMessage = {
            role: "assistant",
            content: data.data.reply,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMessage]);
        }, 800);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error:", error);
      setIsTyping(false);
      const errorMessage = {
        role: "assistant",
        content: "Oops! I'm having trouble connecting right now. Please try again in a moment. 🔄",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Remove emoji from suggestion before sending
    const cleanSuggestion = suggestion.replace(/[^\w\s?]/gi, '').trim();
    sendMessage(cleanSuggestion);
  };

  const handleNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "👋 Starting fresh! What would you like to know about jobs, CVs, or our platform?",
        timestamp: new Date(),
      }
    ]);
    setShowSuggestions(true);
    fetchSuggestions();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-500">
          <button
            onClick={() => setIsOpen(true)}
            className="relative group"
          >
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 bg-[#1800ad] rounded-full animate-ping opacity-20" />
            
            {/* Main button */}
            <div className="relative w-16 h-16 bg-gradient-to-br from-[#1800ad] to-[#2d0fd4] text-white rounded-full shadow-2xl shadow-[#1800ad]/40 hover:shadow-[#1800ad]/60 transition-all duration-300 flex items-center justify-center group-hover:scale-110">
              <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
              
              {/* Online indicator */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-white shadow-lg">
                <div className="w-full h-full rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-xl">
                Need help? Chat with AI 💬
                <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[440px] h-[680px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100 animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#1800ad] via-[#2d0fd4] to-[#1800ad] bg-[length:200%_100%] animate-gradient p-6 text-white">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] animate-pulse" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* AI Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </div>

                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    AI Recruiter
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </h3>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Always here to help</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewChat}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                  title="New conversation"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom duration-300`}
              >
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 bg-gradient-to-br from-[#1800ad] to-[#2d0fd4] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={`rounded-2xl px-5 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-[#1800ad] to-[#2d0fd4] text-white shadow-lg shadow-[#1800ad]/20"
                        : "bg-white border border-gray-200 text-gray-800 shadow-md"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className={`text-xs mt-1 px-2 ${msg.role === "user" ? "text-gray-500 text-right" : "text-gray-400"}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>

                {msg.role === "user" && (
                  <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start animate-in slide-in-from-bottom duration-300">
                <div className="w-9 h-9 bg-gradient-to-br from-[#1800ad] to-[#2d0fd4] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#1800ad] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#1800ad] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#1800ad] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-600 ml-1">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {showSuggestions && messages.length === 1 && !isLoading && !isTyping && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 px-2">
                  <Lightbulb className="w-4 h-4 text-[#1800ad]" />
                  <p className="text-xs text-gray-600 font-semibold">Quick questions to get started:</p>
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-[#1800ad] hover:bg-gradient-to-r hover:from-[#1800ad]/5 hover:to-[#2d0fd4]/5 transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <span className="group-hover:text-[#1800ad] font-medium">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  rows={1}
                  disabled={isLoading}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 outline-none text-gray-800 placeholder-gray-400 resize-none text-[15px] focus:border-[#1800ad] focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ maxHeight: '120px' }}
                />
                {inputMessage && (
                  <div className="absolute right-3 top-3 text-xs text-gray-400">
                    {inputMessage.length}/500
                  </div>
                )}
              </div>
              
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="w-12 h-12 bg-gradient-to-br from-[#1800ad] to-[#2d0fd4] text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-[#1800ad]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex-shrink-0 group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-3">
              <Zap className="w-3 h-3 text-[#1800ad]" />
              <p className="text-xs text-gray-500">
                Powered by Free Gemini AI • Press Enter to send
              </p>
            </div>
          </div>
        </div>
        
    

      )}
      

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </>
  );
}