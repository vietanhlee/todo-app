import React from "react";
import clsx from "clsx";
import { Priority } from "../../types";

const colors: Record<Priority, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};
const dots: Record<Priority, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

interface Props {
  priority: Priority;
  size?: "sm" | "md";
}

const PriorityBadge: React.FC<Props> = ({ priority, size = "md" }) => (
  <span
    className={clsx(
      "inline-flex items-center gap-1 rounded-full font-medium capitalize",
      colors[priority],
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
    )}
  >
    <span className={clsx("w-1.5 h-1.5 rounded-full", dots[priority])} />
    {priority}
  </span>
);

export default PriorityBadge;
