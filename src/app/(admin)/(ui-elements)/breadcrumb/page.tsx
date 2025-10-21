
import { Metadata } from "next";
import React from "react";
import DefaultBreadCrumbExample from "@/components/ui/breadcrumb/DefaultBreadCrumbExample";
import BreadCrumbWithIcon from "@/components/ui/breadcrumb/BreadCrumbWithIcon";
import AngleDividerBreadCrumb from "@/components/ui/breadcrumb/AngleDividerBreadCrumb";
import DottedDividerBreadcrumb from "@/components/ui/breadcrumb/DottedDividerBreadcrumb";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "Next.js Breadcrumb | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Breadcrumb page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function BreadcrumbPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Breadcrumb" />
      <DefaultBreadCrumbExample />
        <BreadCrumbWithIcon />
        <AngleDividerBreadCrumb />
        <DottedDividerBreadcrumb />
      </div>
  );
}
