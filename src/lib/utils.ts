import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  formatDistance,
  formatDistanceToNow,
  isValid,
  parseISO,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = "PPP"
): string {
  if (!date) return "N/A";

  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "Invalid Date";

  return format(parsedDate, formatStr);
}

export function formatDateDistance(
  date: string | Date | null | undefined
): string {
  if (!date) return "N/A";

  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "Invalid Date";

  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date
): string {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) return "Invalid Date Range";

  return formatDistance(start, end);
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    suspended: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
    basic: "bg-blue-100 text-blue-800",
    premium: "bg-purple-100 text-purple-800",
    enterprise: "bg-indigo-100 text-indigo-800",
  };

  return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
}

export function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    manager: "bg-blue-100 text-blue-800",
    user: "bg-green-100 text-green-800",
  };

  return roleColors[role.toLowerCase()] || "bg-gray-100 text-gray-800";
}

export function formatCurrency(
  amount: number | string,
  currency: string = "USD"
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(numAmount);
}

export function formatNumber(num: number | string): string {
  const number = typeof num === "string" ? parseFloat(num) : num;

  if (isNaN(number)) return "N/A";

  return new Intl.NumberFormat("en-US").format(number);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generatePassword(length: number = 12): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getAccessExpiryStatus(accessValidTill?: string | null): {
  status: "expired" | "expiring" | "active" | "no-expiry";
  daysLeft?: number;
  color: string;
} {
  if (!accessValidTill) {
    return {
      status: "no-expiry",
      color: "bg-gray-100 text-gray-800",
    };
  }

  const expiryDate = parseISO(accessValidTill);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: "expired",
      daysLeft: Math.abs(daysLeft),
      color: "bg-red-100 text-red-800",
    };
  } else if (daysLeft <= 7) {
    return {
      status: "expiring",
      daysLeft,
      color: "bg-yellow-100 text-yellow-800",
    };
  } else {
    return {
      status: "active",
      daysLeft,
      color: "bg-green-100 text-green-800",
    };
  }
}

export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
