import type { Metadata } from "next";
import { StudyProvider } from "@/components/study-provider";
import { Shell } from "@/components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "InterviewOS — Your interview preparation workspace",
    template: "%s · InterviewOS",
  },
  description:
    "Learn JavaScript, React, Next.js, algorithms, and system design. Practice, track your confidence, and build a lasting revision habit.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StudyProvider>
          <Shell>{children}</Shell>
        </StudyProvider>
      </body>
    </html>
  );
}
