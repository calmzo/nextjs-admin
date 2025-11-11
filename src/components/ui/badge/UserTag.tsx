import React from "react";
import Badge, { type BadgeColor } from "./Badge";

const GENDER_MAP: Record<number, { label: string; color: BadgeColor }> = {
  1: { label: "男", color: "info" },
  2: { label: "女", color: "warning" },
  0: { label: "未知", color: "light" },
};

const STATUS_MAP: Record<number, { label: string; color: BadgeColor }> = {
  1: { label: "启用", color: "success" },
  0: { label: "禁用", color: "error" },
};

export interface UserTagProps extends Omit<React.ComponentProps<typeof Badge>, 'children'> {
  type: "gender" | "status";
  value?: number;
  label?: string;
  children?: React.ReactNode;
}

const UserTag: React.FC<UserTagProps> = ({ type, value, label, children, ...rest }) => {
  let tag: { label: string; color: BadgeColor };
  if (type === "gender") {
    tag = GENDER_MAP[value ?? 0] || { label: "-", color: "light" };
  } else if (type === "status") {
    tag = STATUS_MAP[value ?? 0] || { label: "-", color: "light" };
  } else {
    tag = { label: "-", color: "light" };
  }
  return (
    <Badge size="sm" variant="light" color={tag.color} {...rest}>
      {children ?? label ?? tag.label}
    </Badge>
  );
};

export default UserTag;
