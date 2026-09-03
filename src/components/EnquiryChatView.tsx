import React, { useState, useRef, useEffect } from 'react';
import { useClaimStore } from '../store/useClaimStore';
import {
  sendPolicyEnquiry,
  PolicyEnquiryResponse,
  RagSource,
} from '../api/claimerApi';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: RagSource[];
  confidence?: number;
  model?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: `Hello Jane! I am your **ClaimShield Policy RAG Assistant**.\n\nI have indexed your active **Motor Policy POL-882** for your **2020 Toyota Camry**.\n\nYou can ask me anything about your coverage, deductible clauses, repair reimbursement rules, zero depreciation add-ons, or required claim documents.`,
    timestamp: 'Just now',
    confidence: 0.98,
    model: 'ClaimShield-RAG-v2',
  },
];

const SUGGESTED_QUESTIONS = [
  'What is my compulsory deductible amount?',
  'Does my policy cover front bumper replacement?',
  'How much towing expense is reimbursed?',
  'What documents are required for reimbursement claim?',
  'Are consumables like engine oil covered?',
];

export const EnquiryChatView: React.FC = () => {
  const currentUser = useClaimStore((state) => state.currentUser);
  const policyNumber = currentUser?.policyNumber || 'POL-882';

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender,
        content: m.text,
      }));

      const res: PolicyEnquiryResponse = await sendPolicyEnquiry({
        query: textToSend,
        policyNumber,
        chatHistory: history,
      });

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: res.confidence,
        model: res.model,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Apologies, I encountered an issue retrieving policy clauses. Please try asking your question again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Helper to render bold markdown (**text**) and bullet lists nicely
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      // Process bold markers **
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-bold text-[#0f1c2b]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.startsWith('• ')) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 ml-2 my-0.5">
            <span className="text-[#00355f] font-bold text-xs mt-0.5">•</span>
            <span className="text-xs leading-relaxed text-[#334155]">{formattedLine.slice(1)}</span>
          </div>
        );
      }

      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 ml-2 my-1">
            <span className="text-xs leading-relaxed text-[#334155]">{formattedLine}</span>
          </div>
        );
      }

      return (
        <p key={lineIdx} className="text-xs leading-relaxed text-[#334155] min-h-[14px]">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col h-[calc(100vh-6.5rem)] pb-4">
      {/* Top Header Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 sm:p-5 shadow-xs mb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00355f] to-[#0f4c81] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#0f1c2b] tracking-tight">
                  Policy Enquiry Assistant
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  RAG Active
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Grounded knowledge base indexed for Policy{' '}
                <span className="font-bold text-[#00355f]">{policyNumber}</span> • 2020 Toyota Camry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleResetChat}
              className="text-xs font-semibold text-slate-600 hover:text-[#00355f] hover:bg-[#eef4ff] px-3 py-1.5 rounded-lg border border-[#e2e8f0] transition-colors cursor-pointer flex items-center gap-1"
              title="Reset conversation"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Reset Chat
            </button>
          </div>
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">tips_and_updates</span>
            Quick Queries:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-[11px] font-medium bg-slate-50 hover:bg-[#eef4ff] text-slate-700 hover:text-[#00355f] border border-slate-200 hover:border-[#cde5fc] rounded-full px-3 py-1 whitespace-nowrap transition-all cursor-pointer flex-shrink-0 active:scale-95 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed Container */}
      <div className="flex-1 bg-white border border-[#e2e8f0] rounded-xl p-4 sm:p-5 shadow-xs overflow-y-auto custom-scrollbar flex flex-col space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                  isUser
                    ? 'bg-[#00355f]'
                    : 'bg-gradient-to-tr from-[#00355f] to-[#3b82f6] shadow-2xs'
                }`}
              >
                {isUser ? (
                  <span className="material-symbols-outlined text-[18px]">person</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                )}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 transition-all ${
                  isUser
                    ? 'bg-[#00355f] text-white rounded-tr-xs shadow-xs'
                    : 'bg-[#f8fafc] border border-[#e2e8f0] text-[#1e293b] rounded-tl-xs shadow-2xs'
                }`}
              >
                {/* Header (for Assistant messages) */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200/60 text-[11px] text-slate-500">
                    <span className="font-bold text-[#00355f] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">psychology</span>
                      Policy RAG Engine
                    </span>
                    {msg.confidence !== undefined && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {(msg.confidence * 100).toFixed(0)}% Confidence
                      </span>
                    )}
                  </div>
                )}

                {/* Body Text */}
                <div className="space-y-1.5">
                  {isUser ? (
                    <p className="text-xs leading-relaxed text-white whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}
                </div>

                {/* Bubble Footer */}
                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-white/70' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(msg.text)}
                      className="hover:text-[#00355f] p-1 rounded transition-colors flex items-center gap-0.5 cursor-pointer"
                      title="Copy response"
                    >
                      <span className="material-symbols-outlined text-[13px]">content_copy</span>
                      <span>Copy</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing / Thinking Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00355f] to-[#3b82f6] flex items-center justify-center text-white flex-shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            </div>
            <div className="bg-[#f8fafc] border border-[#cde5fc] rounded-2xl rounded-tl-xs p-3.5 shadow-2xs max-w-sm">
              <div className="flex items-center gap-2 text-xs text-[#00355f] font-semibold">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00355f] animate-bounce"></span>
                  <span
                    className="w-2 h-2 rounded-full bg-[#00355f] animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full bg-[#00355f] animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  ></span>
                </div>
                <span>Searching policy knowledge base with RAG...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Box */}
      <div className="mt-3 bg-white border border-[#e2e8f0] rounded-xl p-2.5 sm:p-3 shadow-sm flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] focus-within:border-[#00355f] focus-within:bg-white transition-all p-2">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any question regarding your insurance policy (e.g., deductible, towing, bumper coverage)..."
              rows={2}
              className="w-full bg-transparent resize-none border-none outline-none text-xs text-[#0f1c2b] placeholder:text-slate-400 custom-scrollbar leading-relaxed"
            />
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[10px] text-slate-400">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span className="text-[#00355f] font-semibold">Policy: {policyNumber}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-xs ${
              inputText.trim() && !isLoading
                ? 'bg-[#00355f] hover:bg-[#0f4c81] text-white active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title="Send query"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnquiryChatView;
