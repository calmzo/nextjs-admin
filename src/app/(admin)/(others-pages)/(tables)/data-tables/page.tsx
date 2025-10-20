import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTableOne from "@/components/tables/data-tables/data-table-one//DataTableOne";
import DataTableTwo from "@/components/tables/data-tables/data-table-two/DataTableTwo";
import DataTableThree from "@/components/tables/data-tables/data-table-three/DataTableThree";

import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Data Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Data Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Data Table" />
      <div className="space-y-6">
        <ComponentCard title="Data Table 1">
          <DataTableOne />
        </ComponentCard>
        <ComponentCard title="Data Table 2">
          <DataTableTwo />
        </ComponentCard>
        <ComponentCard title="Data Table 3">
          <DataTableThree />
        </ComponentCard>
      </div>
    </div>
  );
}
