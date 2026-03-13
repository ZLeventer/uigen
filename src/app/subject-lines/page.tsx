"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail, Sparkles } from "lucide-react";

interface SubjectLineResult {
  subjectLine: string;
  charCount: number;
  explanation: string;
}

interface SubjectLineResponse {
  identifiedCTA: string;
  subjectLines: SubjectLineResult[];
  whyTheseWork: string;
}

export default function SubjectLinesPage() {
  const [url, setUrl] = useState("");
  const [specifics, setSpecifics] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SubjectLineResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/subject-lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, specifics: specifics || undefined }),
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

  return (
    <main className="min-h-screen bg-white py-16 px-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ backgroundColor: "#ebebeb", color: "#282828" }}
          >
            <Mail className="size-4" />
            Email Subject Line Generator
          </div>
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "#282828" }}
          >
            Generate Subject Lines
          </h1>
          <p className="mt-3 text-base" style={{ color: "#666666" }}>
            Paste a landing page URL and get 3 curiosity-driven subject lines
            optimized for B2B supply chain audiences.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg p-6 shadow-sm"
          style={{ backgroundColor: "#fafafa", border: "1px solid #ebebeb" }}
        >
          <div className="space-y-2">
            <label
              htmlFor="url"
              className="block text-sm font-medium"
              style={{ color: "#282828" }}
            >
              Landing Page URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://example.com/landing-page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-md px-3 py-2 text-sm outline-none transition-shadow disabled:opacity-50"
              style={{
                border: "1px solid #cccccc",
                color: "#282828",
                backgroundColor: "#ffffff",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3d8080")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#cccccc")}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="specifics"
              className="block text-sm font-medium"
              style={{ color: "#282828" }}
            >
              Specifics to Include{" "}
              <span style={{ color: "#999999" }} className="font-normal">
                (optional)
              </span>
            </label>
            <textarea
              id="specifics"
              placeholder="e.g., Mention the webinar date (March 20), include the keynote speaker's name, focus on the ROI angle..."
              value={specifics}
              onChange={(e) => setSpecifics(e.target.value)}
              rows={3}
              disabled={loading}
              className="w-full rounded-md px-3 py-2 text-sm outline-none transition-shadow disabled:opacity-50"
              style={{
                border: "1px solid #cccccc",
                color: "#282828",
                backgroundColor: "#ffffff",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3d8080")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#cccccc")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#3d8080" }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#1e5b67")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#3d8080")}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Subject Lines
              </>
            )}
          </button>
        </form>

        {error && (
          <div
            className="mt-6 rounded-lg p-4 text-sm"
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {results && (
          <div className="mt-8 space-y-6">
            <div
              className="rounded-lg p-5 shadow-sm"
              style={{
                backgroundColor: "#f7faf6",
                border: "1px solid #a3ca8c",
              }}
            >
              <h2
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: "#809a4d" }}
              >
                Identified CTA
              </h2>
              <p className="text-base" style={{ color: "#282828" }}>
                {results.identifiedCTA}
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className="text-lg font-semibold"
                style={{ color: "#282828" }}
              >
                Subject Lines
              </h2>
              {results.subjectLines.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg p-5 shadow-sm"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #ebebeb",
                    borderLeft: "4px solid #3d8080",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className="text-lg font-medium"
                      style={{ color: "#282828" }}
                    >
                      {item.subjectLine}
                    </p>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor:
                          item.charCount <= 50
                            ? "#a3ca8c20"
                            : item.charCount <= 60
                              ? "#e8ce9640"
                              : "#c69a3f30",
                        color:
                          item.charCount <= 50
                            ? "#517222"
                            : item.charCount <= 60
                              ? "#8e7029"
                              : "#8e7029",
                      }}
                    >
                      {item.charCount} chars
                    </span>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: "#666666" }}>
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="rounded-lg p-5 shadow-sm"
              style={{
                backgroundColor: "#f5f0fa",
                border: "1px solid #b3ace8",
              }}
            >
              <h2
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: "#7239a4" }}
              >
                Why These Work
              </h2>
              <p className="text-base" style={{ color: "#282828" }}>
                {results.whyTheseWork}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
