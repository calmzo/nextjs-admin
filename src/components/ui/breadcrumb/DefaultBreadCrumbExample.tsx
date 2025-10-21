import ComponentCard from "@/components/common/ComponentCard";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  return (
    <nav className={className}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="text-gray-500 dark:text-gray-400"> / </span>
              )}

              {item.href && !isLast ? (
                <Link
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                  href={item.href}
                >
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-gray-800 dark:text-white/90">
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default function DefaultBreadCrumbExample() {
  const items1: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Ui Kits" }
  ];

  const items2: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Ui Kits", href: "#" },
    { label: "Avatar" }
  ];

  return (
    <ComponentCard title="Default Breadcrumb">
      <div className="space-y-5">
        <Breadcrumb items={items1} />
        <Breadcrumb items={items2} />
      </div>
    </ComponentCard>
  );
}
