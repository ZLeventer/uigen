"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

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

const brandFont =
  "Graphik, Arial, -apple-system, BlinkMacSystemFont, sans-serif";

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
    <main
      className="min-h-screen bg-white"
      style={{ fontFamily: brandFont }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, #3d8080 0%, #a3ca8c 33%, #7239a4 66%, #c69a3f 100%)",
        }}
      />

      <div className="mx-auto max-w-xl px-6 py-20">
        <header className="mb-14">
          <p
            className="text-xs uppercase tracking-[0.2em] mb-6"
            style={{ color: "#3d8080", fontWeight: 500, letterSpacing: "0.2em" }}
          >
            Email Subject Line Generator
          </p>
          <h1
            className="text-4xl tracking-tight sm:text-5xl leading-tight"
            style={{ color: "#282828", fontWeight: 300 }}
          >
            Generate Subject Lines
          </h1>
          <p
            className="mt-5 text-base leading-relaxed"
            style={{ color: "#666666", fontWeight: 300 }}
          >
            Paste a landing page URL and get 3 curiosity-driven subject lines
            optimized for B2B supply chain audiences.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label
              htmlFor="url"
              className="block text-sm"
              style={{ color: "#282828", fontWeight: 500 }}
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
              className="w-full px-0 py-3 text-base outline-none transition-colors disabled:opacity-50"
              style={{
                border: "none",
                borderBottom: "1px solid #cccccc",
                borderRadius: 0,
                color: "#282828",
                backgroundColor: "transparent",
                fontFamily: brandFont,
                fontWeight: 300,
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderBottomColor = "#3d8080")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderBottomColor = "#cccccc")
              }
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="specifics"
              className="block text-sm"
              style={{ color: "#282828", fontWeight: 500 }}
            >
              Specifics to Include{" "}
              <span style={{ color: "#999999", fontWeight: 300 }}>
                (optional)
              </span>
            </label>
            <textarea
              id="specifics"
              placeholder="e.g., Mention the webinar date, include the keynote speaker's name, focus on the ROI angle..."
              value={specifics}
              onChange={(e) => setSpecifics(e.target.value)}
              rows={3}
              disabled={loading}
              className="w-full px-0 py-3 text-base outline-none transition-colors disabled:opacity-50 resize-none"
              style={{
                border: "none",
                borderBottom: "1px solid #cccccc",
                borderRadius: 0,
                color: "#282828",
                backgroundColor: "transparent",
                fontFamily: brandFont,
                fontWeight: 300,
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderBottomColor = "#3d8080")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderBottomColor = "#cccccc")
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 text-sm text-white transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "#3d8080",
              fontFamily: brandFont,
              fontWeight: 500,
              letterSpacing: "0.05em",
              borderRadius: 0,
            }}
            onMouseEnter={(e) =>
              !loading && (e.currentTarget.style.backgroundColor = "#1e5b67")
            }
            onMouseLeave={(e) =>
              !loading && (e.currentTarget.style.backgroundColor = "#3d8080")
            }
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Subject Lines"
            )}
          </button>
        </form>

        {error && (
          <div
            className="mt-10 py-4 text-sm"
            style={{
              borderLeft: "3px solid #c44040",
              paddingLeft: "16px",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {results && (
          <div className="mt-16 space-y-12">
            {/* Identified CTA */}
            <div>
              <p
                className="text-xs uppercase tracking-[0.15em] mb-2"
                style={{ color: "#a3ca8c", fontWeight: 500 }}
              >
                Identified CTA
              </p>
              <p
                className="text-lg"
                style={{ color: "#282828", fontWeight: 300 }}
              >
                {results.identifiedCTA}
              </p>
              <div
                className="mt-4 h-px w-12"
                style={{ backgroundColor: "#a3ca8c" }}
              />
            </div>

            {/* Subject Lines */}
            <div className="space-y-8">
              <p
                className="text-xs uppercase tracking-[0.15em]"
                style={{ color: "#3d8080", fontWeight: 500 }}
              >
                Subject Lines
              </p>
              {results.subjectLines.map((item, i) => (
                <div
                  key={i}
                  style={{ borderLeft: "3px solid #3d8080", paddingLeft: "20px" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className="text-xl"
                      style={{ color: "#282828", fontWeight: 400 }}
                    >
                      {item.subjectLine}
                    </p>
                    <span
                      className="shrink-0 text-xs mt-1"
                      style={{
                        color:
                          item.charCount <= 50
                            ? "#809a4d"
                            : item.charCount <= 60
                              ? "#c69a3f"
                              : "#c44040",
                        fontWeight: 500,
                      }}
                    >
                      {item.charCount}
                    </span>
                  </div>
                  <p
                    className="mt-2 text-sm italic"
                    style={{ color: "#555555", fontWeight: 300 }}
                  >
                    {item.previewText}
                  </p>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: "#666666", fontWeight: 300 }}
                  >
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>

            {/* Why These Work */}
            <div>
              <p
                className="text-xs uppercase tracking-[0.15em] mb-2"
                style={{ color: "#7239a4", fontWeight: 500 }}
              >
                Why These Work
              </p>
              <p
                className="text-base leading-relaxed"
                style={{ color: "#282828", fontWeight: 300 }}
              >
                {results.whyTheseWork}
              </p>
              <div
                className="mt-4 h-px w-12"
                style={{ backgroundColor: "#7239a4" }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
