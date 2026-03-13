"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
            <Mail className="size-4" />
            Email Subject Line Generator
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Generate Subject Lines
          </h1>
          <p className="mt-3 text-muted-foreground">
            Paste a landing page URL and get 3 curiosity-driven subject lines
            optimized for B2B supply chain audiences.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg border bg-card p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="url">Landing Page URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/landing-page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specifics">
              Specifics to Include{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="specifics"
              placeholder="e.g., Mention the webinar date (March 20), include the keynote speaker's name, focus on the ROI angle..."
              value={specifics}
              onChange={(e) => setSpecifics(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles />
                Generate Subject Lines
              </>
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {results && (
          <div className="mt-8 space-y-6">
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-medium text-muted-foreground mb-1">
                Identified CTA
              </h2>
              <p className="text-foreground">{results.identifiedCTA}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Subject Lines</h2>
              {results.subjectLines.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-lg font-medium">{item.subjectLine}</p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.charCount <= 50
                          ? "bg-green-500/15 text-green-700 dark:text-green-400"
                          : item.charCount <= 60
                            ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400"
                            : "bg-orange-500/15 text-orange-700 dark:text-orange-400"
                      }`}
                    >
                      {item.charCount} chars
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-medium text-muted-foreground mb-1">
                Why These Work
              </h2>
              <p className="text-foreground">{results.whyTheseWork}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
