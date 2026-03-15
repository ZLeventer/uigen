"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Link2, Mail, Sparkles, Copy, Check, MessageSquare, ChevronDown } from "lucide-react";

interface SubjectLineResult {
  subjectLine: string;
  charCount: number;
  previewText: string;
  explanation: string;
}

interface SubjectLineResponse {
  identifiedCTA: string;
  subjectLines: SubjectLineResult[];
  whyTheseWork: string;
}

const PURPOSE_OPTIONS = [
  { value: "", label: "Select a purpose..." },
  { value: "event-invite", label: "Event Invite" },
  { value: "event-reminder", label: "Event Reminder" },
  { value: "event-last-call", label: "Event Last Call" },
  { value: "content-download", label: "Content Download Promotion" },
  { value: "follow-up-attended", label: "Follow Up — Attended" },
  { value: "follow-up-no-show", label: "Follow Up — No Show" },
];

export default function SubjectLinesPage() {
  const [url, setUrl] = useState("");
  const [purpose, setPurpose] = useState("");
  const [specifics, setSpecifics] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SubjectLineResponse | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    setFeedbackSent(false);
    setFeedbackError(null);
    setFeedback("");

    try {
      const res = await fetch("/api/subject-lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          purpose: purpose || undefined,
          specifics: specifics || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResults(data);
    } catch {
      setError("Network error — please check your connection and try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback() {
    if (!feedback.trim()) return;
    setFeedbackSending(true);
    setFeedbackError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFeedbackError(data.error || "Failed to send feedback");
        return;
      }

      setFeedbackSent(true);
    } catch {
      setFeedbackError("Network error — please try again");
    } finally {
      setFeedbackSending(false);
    }
  }

  function handleCopy(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function charCountColor(count: number) {
    if (count <= 50) return "#16a34a";
    if (count <= 60) return "#ca8a04";
    return "#dc2626";
  }

  function charCountBg(count: number) {
    if (count <= 50) return "#f0fdf4";
    if (count <= 60) return "#fefce8";
    return "#fef2f2";
  }

  return (
    <main className="min-h-screen relative" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Background */}
      <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(135deg, #f0f4f4 0%, #f7f5fb 50%, #faf8f0 100%)" }} />
      <div className="fixed inset-0 -z-10 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(61,128,128,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(114,57,164,0.06) 0%, transparent 50%)" }} />

      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #3d8080 0%, #a3ca8c 33%, #7239a4 66%, #c69a3f 100%)" }} />

      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ backgroundColor: "rgba(61,128,128,0.08)", border: "1px solid rgba(61,128,128,0.15)" }}>
            <Mail className="size-3.5" style={{ color: "#3d8080" }} />
            <span className="text-xs font-medium tracking-wide uppercase" style={{ color: "#3d8080" }}>
              Email Subject Line Generator
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: "#1a1a1a" }}>
            Generate Subject Lines
          </h1>
          <p className="mt-3 text-sm" style={{ color: "#6b7280" }}>
            Paste a landing page URL and get curiosity-driven subject lines powered by AI
          </p>
        </header>

        {/* Form Card */}
        <div className="rounded-2xl p-6 sm:p-8 mb-8" style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)", border: "1px solid rgba(255,255,255,0.8)" }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
                Landing Page URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" style={{ color: "#9ca3af" }} />
                <input
                  id="url"
                  type="url"
                  placeholder="https://example.com/landing-page"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none transition-all disabled:opacity-50"
                  style={{
                    border: "1.5px solid #e5e7eb",
                    color: "#1a1a1a",
                    backgroundColor: "#fafafa",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#3d8080";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,128,128,0.1)";
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.backgroundColor = "#fafafa";
                  }}
                />
              </div>
            </div>

            {/* Purpose Select */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
                Purpose of Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" style={{ color: "#9ca3af" }} />
                <select
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-xl outline-none transition-all disabled:opacity-50 appearance-none cursor-pointer"
                  style={{
                    border: "1.5px solid #e5e7eb",
                    color: purpose ? "#1a1a1a" : "#9ca3af",
                    backgroundColor: "#fafafa",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#3d8080";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,128,128,0.1)";
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.backgroundColor = "#fafafa";
                  }}
                >
                  {PURPOSE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: "#9ca3af" }} />
              </div>
            </div>

            {/* Specifics Textarea */}
            <div>
              <label htmlFor="specifics" className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
                Specifics to Include{" "}
                <span className="font-normal" style={{ color: "#9ca3af" }}>(optional)</span>
              </label>
              <textarea
                id="specifics"
                placeholder="e.g., Mention the webinar date, include the keynote speaker's name, focus on the ROI angle..."
                value={specifics}
                onChange={(e) => setSpecifics(e.target.value)}
                rows={3}
                disabled={loading}
                className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all disabled:opacity-50 resize-none"
                style={{
                  border: "1.5px solid #e5e7eb",
                  color: "#1a1a1a",
                  backgroundColor: "#fafafa",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3d8080";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,128,128,0.1)";
                  e.currentTarget.style.backgroundColor = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.backgroundColor = "#fafafa";
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50"
              style={{
                background: loading ? "#3d8080" : "linear-gradient(135deg, #3d8080 0%, #2d6b6b 100%)",
                boxShadow: loading ? "none" : "0 2px 8px rgba(61,128,128,0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "linear-gradient(135deg, #357070 0%, #265d5d 100%)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(61,128,128,0.4)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "linear-gradient(135deg, #3d8080 0%, #2d6b6b 100%)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(61,128,128,0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analyzing page & generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate Subject Lines
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-4 mb-8 flex items-start gap-3" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
            <div className="shrink-0 mt-0.5 size-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#dc2626", color: "#fff" }}>!</div>
            <p className="text-sm" style={{ color: "#991b1b" }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Identified CTA */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)", border: "1px solid rgba(255,255,255,0.8)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-2 rounded-full" style={{ backgroundColor: "#a3ca8c" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
                  Identified CTA
                </span>
              </div>
              <p className="text-base font-medium" style={{ color: "#1a1a1a" }}>
                {results.identifiedCTA}
              </p>
            </div>

            {/* Subject Lines */}
            {results.subjectLines.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "rgba(61,128,128,0.1)", color: "#3d8080" }}>
                      {i + 1}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
                      Subject Line
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        color: charCountColor(item.charCount),
                        backgroundColor: charCountBg(item.charCount),
                      }}
                    >
                      {item.charCount} chars
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.subjectLine, i)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: copiedIndex === i ? "#16a34a" : "#9ca3af" }}
                      onMouseEnter={(e) => { if (copiedIndex !== i) e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                      title="Copy subject line"
                    >
                      {copiedIndex === i ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Subject Line Text */}
                <p className="text-lg font-semibold mb-4" style={{ color: "#1a1a1a", lineHeight: 1.4 }}>
                  {item.subjectLine}
                </p>

                {/* Preview Text */}
                <div className="rounded-lg px-4 py-3 mb-4" style={{ backgroundColor: "#f8fafb", border: "1px solid #e8eef0" }}>
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "#9ca3af" }}>
                    Preview Text
                  </p>
                  <p className="text-sm" style={{ color: "#4b5563" }}>
                    {item.previewText}
                  </p>
                </div>

                {/* Explanation */}
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                  {item.explanation}
                </p>
              </div>
            ))}

            {/* Why These Work */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)", border: "1px solid rgba(255,255,255,0.8)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-2 rounded-full" style={{ backgroundColor: "#7239a4" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
                  Why These Work
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                {results.whyTheseWork}
              </p>
            </div>

            {/* Feedback */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)", border: "1px solid rgba(255,255,255,0.8)" }}>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="size-4" style={{ color: "#3d8080" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
                  Feedback
                </span>
              </div>
              {feedbackSent ? (
                <div className="flex items-center gap-2 py-2">
                  <Check className="size-4" style={{ color: "#16a34a" }} />
                  <p className="text-sm font-medium" style={{ color: "#16a34a" }}>
                    Thanks for your feedback!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    placeholder="How did the tool work for you? Any suggestions?"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    disabled={feedbackSending}
                    className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all disabled:opacity-50 resize-none"
                    style={{
                      border: "1.5px solid #e5e7eb",
                      color: "#1a1a1a",
                      backgroundColor: "#fafafa",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#3d8080";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,128,128,0.1)";
                      e.currentTarget.style.backgroundColor = "#fff";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.backgroundColor = "#fafafa";
                    }}
                  />
                  {feedbackError && (
                    <p className="text-sm" style={{ color: "#dc2626" }}>
                      {feedbackError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleFeedback}
                    disabled={feedbackSending || !feedback.trim()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #3d8080 0%, #2d6b6b 100%)",
                    }}
                    onMouseEnter={(e) => {
                      if (!feedbackSending) {
                        e.currentTarget.style.background = "linear-gradient(135deg, #357070 0%, #265d5d 100%)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!feedbackSending) {
                        e.currentTarget.style.background = "linear-gradient(135deg, #3d8080 0%, #2d6b6b 100%)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {feedbackSending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Feedback"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
