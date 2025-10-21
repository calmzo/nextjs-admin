
import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RibbonExample from "@/components/ui/ribbons";

export const metadata: Metadata = {
  title: "Next.js Ribbons | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Ribbons page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function RibbonsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Ribbons" />
      <RibbonExample />   
    </div>
  );
}
