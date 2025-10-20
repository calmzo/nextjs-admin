import EmailSidebar from "@/components/email/EmailSidebar/EmailSidebar";
import EmailWrapper from "@/components/email/EmailDetails/EmailWrapper";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Line Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Line Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};
export default function LineChart() {
  return (
    <div className="sm:h-[calc(100vh-174px)] xl:h-[calc(100vh-186px)]">
        <div className="flex flex-col gap-5 xl:grid xl:grid-cols-12 sm:gap-5">
          <div className="xl:col-span-3 col-span-full">
            <EmailSidebar />
          </div>
          <div className="w-full xl:col-span-9">
            <EmailWrapper />
          </div>
        </div>
      </div>
  );
}
