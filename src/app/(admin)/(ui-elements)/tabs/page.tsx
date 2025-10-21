
import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TabExample from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Next.js Tags | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Tags page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function TagsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tags" />
      <TabExample />   
    </div>
  );
}
