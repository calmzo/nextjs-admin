import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import AccountMenuDropdown from "@/components/ui/dropdown/AccountMenuDropdown";
import DropdownWithDivider from "@/components/ui/dropdown/DropdownWithDivider";
import DropdownWithIcon from "@/components/ui/dropdown/DropdownWithIcon";
import DropdownWithIconAndDivider from "@/components/ui/dropdown/DropdownWithIconAndDivider";

export const metadata: Metadata = {
  title: "Next.js Buttons | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Buttons page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Buttons() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Dropdowns" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
        <ComponentCard title="Default Dropdown">
          <div className="pb-[300px]">
            <AccountMenuDropdown />
          </div>
        </ComponentCard>
        <ComponentCard title="Dropdown With Divider">
          <div className="pb-[300px]">
            <DropdownWithDivider />
          </div>
        </ComponentCard>
        <ComponentCard title="Dropdown With Icon">
          <div className="pb-[300px]">
            <DropdownWithIcon />
          </div>
        </ComponentCard>
        <ComponentCard title="Dropdown With Icon and Divider">
          <div className="pb-[300px]">
            <DropdownWithIconAndDivider />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
