import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import BasicTableTwo from "@/components/tables/BasicTableTwo";
import BasicTableThree from "@/components/tables/BasicTableThree";
import BasicTableFour from "@/components/tables/BasicTableFour";
import BasicTableFive from "@/components/tables/BasicTableFive";

import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <BasicTableOne />
        </ComponentCard>
        <ComponentCard title="Basic Table 2">
          <BasicTableTwo />
        </ComponentCard>
        <ComponentCard title="Basic Table 3">
          <BasicTableThree />
        </ComponentCard>
        <ComponentCard title="Basic Table 4">
          <BasicTableFour />
        </ComponentCard>
        <ComponentCard title="Basic Table 5">
          <BasicTableFive />
        </ComponentCard>
      </div>
    </div>
  );
}
