
import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SpinnerExample from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Next.js Spinners | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Spinners page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function SpinnersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Spinners" />
      <SpinnerExample />   
    </div>
  );
}
