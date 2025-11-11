import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, required, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        // Default classes that apply by default
        "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400",

        // User-defined className that can override the default margin
        className
      )}
    >
      {required && <span className="text-red-500 mr-1">*</span>}
      {children}
    </label>
  );
};

export default Label;
