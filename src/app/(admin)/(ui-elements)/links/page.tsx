
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import LinksExample from "@/components/links";

export const metadata: Metadata = {
  title: "Next.js Links | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Links page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function LinksPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Links" />
      <LinksExample />
    </>
  );
}
