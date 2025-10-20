import { Metadata } from "next";
import React from "react";
import EmailContent from "@/components/email/EmailInbox/EmailContent";
import EmailSidebar from "@/components/email/EmailSidebar/EmailSidebar";

export const metadata: Metadata = {
  title: "Next.js Bar Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Bar Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function page() {
  return (
    <div className="sm:h-[calc(100vh-174px)] h-screen xl:h-[calc(100vh-186px)">
    <div className="flex flex-col gap-5 xl:grid xl:grid-cols-12 sm:gap-5">
      <div className="xl:col-span-3 col-span-full">
        <EmailSidebar />
      </div>
      <EmailContent />
    </div>
  </div>
  );
}
