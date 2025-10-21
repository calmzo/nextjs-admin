import CardWithImage from "@/components/cards/card-with-image/CardWithImage";
import HorizontalCardWithImage from "@/components/cards/horizontal-card/HorizontalCardWithImage";
import CardWithLinkExample from "@/components/cards/card-with-link/CardWithLinkExample";
import CardWithIconExample from "@/components/cards/card-with-icon/CardWithIconExample";
import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "Next.js Buttons | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Buttons page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Buttons() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Cards" />
      <div className="space-y-6 sm:space-y-5">
        <CardWithImage />
        <HorizontalCardWithImage />
        <CardWithLinkExample />
        <CardWithIconExample />
      </div>
    </div>
  );
}
