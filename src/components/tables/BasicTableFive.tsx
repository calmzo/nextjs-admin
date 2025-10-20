import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Image from "next/image";

// Define the TypeScript interface for the table rows
interface Product {
  id: number; // Unique identifier for each product
  name: string; // Product name
  category: string; // Category of the product
  country: string; // Price of the product (as a string with currency symbol)
  cr: string; // URL or path to the product image
  value: string;
}

// Define the table data using the interface
const tableData: Product[] = [
  {
    id: 1,
    name: "TailGrids",
    category: "UI Kits",
    country: "/images/country/country-01.svg",
    cr: "Dashboard",
    value: "12,499", // Replace with actual image URL
  },
  {
    id: 2,
    name: "GrayGrids",
    category: "Templates",
    country: "/images/country/country-02.svg",
    cr: "Dashboard",
    value: "5498", // Replace with actual image URL
  },
  {
    id: 3,
    name: "Uideck",
    category: "Templates",
    country: "/images/country/country-03.svg",
    cr: "Dashboard",
    value: "4621", // Replace with actual image URL
  },
  {
    id: 4,
    name: "FormBold",
    category: "SaaS",
    country: "/images/country/country-04.svg",
    cr: "Dashboard",
    value: "13843", // Replace with actual image URL
  },
  {
    id: 5,
    name: "NextAdmin",
    category: "Templates",
    country: "/images/country/country-05.svg",
    cr: "Dashboard",
    value: "7523", // Replace with actual image URL
  },
  {
    id: 6,
    name: "Form Builder",
    category: "Templates",
    country: "/images/country/country-06.svg",
    cr: "Dashboard",
    value: "1,377", // Replace with actual image URL
  },
  {
    id: 7,
    name: "AyroUI",
    category: "Templates",
    country: "/images/country/country-07.svg",
    cr: "Dashboard",
    value: "599,00", // Replace with actual image URL
  },
];

export default function BasicTableFive() {
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
                  分类
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  国家
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  渠道
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  数值
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {product.name}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {product.category}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="w-5 h-5 overflow-hidden rounded-full">
                      <Image
                        width={20}
                        height={20}
                        src={product.country}
                        className="w-5 h-5 rounded-full"
                        alt="country"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {product.cr}
                  </TableCell>
                  <TableCell className="px-4 text-theme-sm sm:px-6 text-start text-success-600">
                    {product.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
