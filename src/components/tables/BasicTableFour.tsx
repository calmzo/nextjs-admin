import React from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface Campaign {
  id: number;
  creator: {
    image: string;
    name: string;
  };
  campaign: {
    image: string;
    name: string;
    type: string;
  };
  status: string;
}

const campaigns: Campaign[] = [
  {
    id: 1,
    creator: {
      image: "/images/user/user-01.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-01.svg",
      name: "Grow your brand by...",
      type: "Ads campaign",
    },
    status: "Success",
  },
  {
    id: 2,
    creator: {
      image: "/images/user/user-02.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-02.svg",
      name: "Make Better Ideas...",
      type: "Ads campaign",
    },
    status: "Pending",
  },
  {
    id: 3,
    creator: {
      image: "/images/user/user-03.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-03.svg",
      name: "Increase your website tra...",
      type: "Ads campaign",
    },
    status: "Success",
  },
  {
    id: 4,
    creator: {
      image: "/images/user/user-04.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-04.svg",
      name: "Grow your brand by...",
      type: "Ads campaign",
    },
    status: "Failed",
  },
  {
    id: 5,
    creator: {
      image: "/images/user/user-05.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-05.svg",
      name: "Grow your brand by...",
      type: "Ads campaign",
    },
    status: "Success",
  },
  {
    id: 6,
    creator: {
      image: "/images/user/user-06.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-06.svg",
      name: "Grow your brand by...",
      type: "Ads campaign",
    },
    status: "Success",
  },
];

export default function BasicTableFour() {
  // Keep memoized row for performance; style will follow BasicTableOne layout
  const CampaignRow = React.memo(function CampaignRow({ item }: { item: Campaign }) {
    return (
      <TableRow key={item.id} className="">
        <TableCell className="px-5 py-4 sm:px-6 text-start">
          <div className="flex items-center gap-[18px]">
            <div className="w-10 h-10 overflow-hidden rounded-full">
              <Image
                width={40}
                height={40}
                className="w-full size-10"
                src={item.creator.image}
                alt={`${item.creator.name} avatar`}
              />
            </div>
            <div>
              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {item.creator.name}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          <div className="flex items-center w-full gap-5">
            <div className="w-full max-w-8">
              <Image
                width={32}
                height={32}
                className="w-full size-8"
                src={item.campaign.image}
                alt={`${item.campaign.name} logo`}
              />
            </div>
            <div className="truncate">
              <p className="mb-0.5 truncate text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                {item.campaign.name}
              </p>
              <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                {item.campaign.type}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          <Badge
            size="sm"
            color={
              item.status === "Success"
                ? "success"
                : item.status === "Pending"
                ? "warning"
                : "error"
            }
          >
            {item.status}
          </Badge>
        </TableCell>
      </TableRow>
    );
  });
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  产品
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  活动
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  状态
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {campaigns.map((item) => (
                <CampaignRow key={item.id} item={item} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
