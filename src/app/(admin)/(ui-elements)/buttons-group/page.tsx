
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import ButtonGroupExample from "@/components/ui/buttons-group";

export const metadata: Metadata = {
  title: "Next.js Breadcrumb | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Breadcrumb page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function BreadcrumbPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Buttons Group" />
      <ButtonGroupExample />
    </div>
  );
}
