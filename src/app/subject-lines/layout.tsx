import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subject Line Generator",
  description:
    "Generate curiosity-driven email subject lines from any landing page URL",
};

export default function SubjectLinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
