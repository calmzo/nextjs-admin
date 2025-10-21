
import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProgressBarExample from "@/components/ui/progressbar";

export const metadata: Metadata = {
  title: "Next.js ProgressBar | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js ProgressBar page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function ProgressBarPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="ProgressBar" />
      <ProgressBarExample />  
    </div>
  );
}
