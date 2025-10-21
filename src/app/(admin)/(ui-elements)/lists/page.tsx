
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ListExample from "@/components/list";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Lists | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Lists page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function ListsPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Lists" />
      <ListExample />
    </>
  );
}
