import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getLanguageModel } from "@/lib/provider";

export const maxDuration = 60;

const SubjectLineResponseSchema = z.object({
  identifiedCTA: z
    .string()
    .describe("The primary CTA identified on the landing page"),
  subjectLines: z
    .array(
      z.object({
        subjectLine: z.string(),
        charCount: z.number(),
        explanation: z.string(),
      })
    )
    .length(3),
  whyTheseWork: z
    .string()
    .describe("Summary of why these subject lines are effective"),
});

function extractTextFromHtml(html: string): string {
  // Remove boilerplate sections that contain generic site-wide CTAs
  let cleaned = html
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

  // Try to extract just the <main> content if it exists
  const mainMatch = cleaned.match(/<main[\s\S]*?<\/main>/i);
  if (mainMatch) {
    cleaned = mainMatch[0];
  }

  return cleaned
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);
}

function buildPrompt(pageContent: string, specifics?: string): string {
  return `You are an expert B2B email marketing copywriter specializing in supply chain SaaS.

Analyze the following landing page content and generate 3 email subject lines that would drive opens and clicks to this page.

## Landing Page Content:
${pageContent}

${specifics ? `## Additional Requirements:\n${specifics}\n` : ""}
## Identifying the Primary CTA:

The primary CTA is the ONE specific action this landing page was built to drive. It is NOT a generic site-wide element. Follow these rules:
- IGNORE generic site CTAs: "Contact Us", "Subscribe to Newsletter", "Request a Demo" (unless the entire page is a demo request page), cookie consent, footer links
- LOOK FOR the page-specific CTA: event registration, content download, webinar signup, report access, product trial — the action tied to the unique offer on THIS page
- The primary CTA is usually the most prominent button/form in the hero or main content area, often repeated 2-3 times on the page
- If the page headline promises something specific (a webinar, a guide, a report), the CTA is the action that delivers on that promise

## Subject Line Principles:

**Curiosity-driven, not clickbait.** Create an open loop — a question or implication the reader can only resolve by opening the email. The payoff must actually be there. Supply chain pros unsubscribe fast if they feel tricked.

Good curiosity patterns:
- Hint at a surprising data point or insight without revealing it
- Reference a shared frustration and imply a new angle
- Use specificity to signal real substance (numbers, names, concrete details)
- Tease a contrarian or counterintuitive idea

**Align with the CTA, not just the topic.** If the page wants someone to register for a webinar, the subject line should make them want to learn something. If it wants a report download, make them want to see the data. The subject line sets up the CTA as the natural resolution.

**Keep them short.** Under 50 characters is ideal for mobile. Under 60 is acceptable. Never exceed 70.

**Audience:** Supply chain professionals — logistics managers, procurement leaders, VP/Director of operations. They're busy, skeptical of marketing fluff, and respond to specificity over hype.

**Each subject line should take a different angle** (e.g., pain point, benefit, curiosity, social proof, contrarian take).

Identify the primary CTA on the page, generate 3 subject lines with explanations of the curiosity hook and connection to the CTA, and summarize why they work as a set.`;
}

export async function POST(request: Request) {
  let body: { url?: string; specifics?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { url, specifics } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "A valid URL is required" },
      { status: 400 }
    );
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json(
      { error: "The provided URL is not valid" },
      { status: 400 }
    );
  }

  let pageHtml: string;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SubjectLineBot/1.0; +https://example.com)",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `The URL returned an error (status ${res.status})` },
        { status: 422 }
      );
    }

    pageHtml = await res.text();
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Could not fetch the URL — it may be unreachable or too slow to respond",
      },
      { status: 422 }
    );
  }

  const pageContent = extractTextFromHtml(pageHtml);

  if (pageContent.length < 50) {
    return NextResponse.json(
      { error: "No readable content found at this URL" },
      { status: 422 }
    );
  }

  try {
    const result = await generateObject({
      model: getLanguageModel(),
      schema: SubjectLineResponseSchema,
      prompt: buildPrompt(pageContent, specifics),
    });

    return NextResponse.json(result.object);
  } catch (err) {
    console.error("Subject line generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate subject lines. Please try again." },
      { status: 500 }
    );
  }
}
