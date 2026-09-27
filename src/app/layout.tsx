import "./globals.css";
import { ApolloWrapper } from "@/components/ApolloWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Release Checklist Tool - Developer Release Process Management",
  description:
    "A functional modern single-page web application for tracking software releases, checklist steps completion, and release lifecycle status.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <ApolloWrapper>
          <div className="min-h-screen flex flex-col justify-between">
            <main>{children}</main>
            <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-900 mt-12">
              <p>Release Checklist Tool &bull; Modern GraphQL + Next.js + PostgreSQL Application</p>
            </footer>
          </div>
        </ApolloWrapper>
      </body>
    </html>
  );
}
