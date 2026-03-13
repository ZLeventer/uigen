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
        previewText: z
          .string()
          .describe(
            "Email preview text (40-90 chars) that complements the subject line and entices the reader to open"
          ),
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

const PURPOSE_GUIDANCE: Record<string, string> = {
  "event-invite": `This is an EVENT INVITATION email. The goal is to get the recipient to register/attend for the first time.
- Create urgency around the event value, not the deadline
- Highlight what they'll learn or who they'll hear from
- The CTA should drive toward registration
- Preview text should tease a specific session, speaker, or insight`,

  "event-reminder": `This is an EVENT REMINDER email for someone already registered.
- Reinforce their decision to register — make them excited, not guilty
- Reference what's coming up (specific sessions, speakers, key topics)
- The tone should be anticipatory, not nagging
- Preview text should surface a specific detail that makes them want to show up`,

  "event-last-call": `This is a LAST CALL / final reminder email before an event.
- Create genuine urgency — seats filling, time running out, last chance to join
- Keep it punchy and direct — no long explanations
- Do NOT use specific time frames like "48 hours", "2 days", "tomorrow" unless the user provides a date in the Additional Requirements. Use timeless urgency instead (e.g., "spots are filling", "don't miss out", "registration closing soon")
- Preview text should reinforce the scarcity or final-chance framing`,

  "content-download": `This is a CONTENT DOWNLOAD PROMOTION email (whitepaper, guide, report, ebook).
- Lead with the insight or data the content contains, not the format
- Make them curious about what's inside — tease a finding or stat
- Avoid generic "download our guide" language
- Preview text should hint at a specific takeaway or data point`,

  "follow-up-attended": `This is a FOLLOW-UP email for someone who ATTENDED an event.
- Reference the event they attended — make it personal
- Offer next steps: recording, slides, related content, or a meeting
- Tone should be warm and continuing the conversation
- Preview text should reference something specific from the event`,

  "follow-up-no-show": `This is a FOLLOW-UP email for someone who REGISTERED but DID NOT ATTEND.
- Don't guilt-trip — assume they were busy
- Lead with what they missed and how they can still get the value (recording, recap, slides)
- Keep it low-pressure but make the content sound unmissable
- Preview text should highlight what they can still access`,
};

function buildPrompt(
  pageContent: string,
  purpose?: string,
  specifics?: string
): string {
  const hasPurpose = purpose && PURPOSE_GUIDANCE[purpose];

  return `You are an expert B2B email marketing copywriter specializing in supply chain SaaS.

${hasPurpose ? `## EMAIL PURPOSE — THIS IS CRITICAL

${PURPOSE_GUIDANCE[purpose!]}

Every subject line, preview text, and explanation you generate MUST be written specifically for this email purpose. The purpose above is the #1 factor shaping your output — it determines the tone, urgency, framing, and what the reader needs to feel.

` : ""}Analyze the following landing page content and generate 3 email subject lines${hasPurpose ? ` for a **${purpose!.replace(/-/g, " ").toUpperCase()}** email` : ""} that would drive opens and clicks to this page.

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

## Preview Text Principles:

For each subject line, also write preview text — the snippet shown after the subject line in the inbox. Preview text should:
- Be 40-90 characters long
- **Complement, not repeat** the subject line — extend the thought or add new information
- Continue the curiosity loop or provide a concrete reason to open
- Never start with "View in browser" or other boilerplate
- Work as a natural continuation when read alongside the subject line
${hasPurpose ? `\n**REMINDER: You are writing for a ${purpose!.replace(/-/g, " ")} email. Every subject line and preview text must reflect this purpose. Do NOT write generic subject lines — write ones that only make sense for a ${purpose!.replace(/-/g, " ")} email.**\n` : ""}
Identify the primary CTA on the page, generate 3 subject lines (each with preview text) and explanations of the curiosity hook and connection to the CTA, and summarize why they work as a set.`;
}

export async function POST(request: Request) {
  let body: { url?: string; purpose?: string; specifics?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { url, purpose, specifics } = body;

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
      prompt: buildPrompt(pageContent, purpose, specifics),
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
