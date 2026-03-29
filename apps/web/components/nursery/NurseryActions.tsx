"use client";

import Link from "next/link";
import { Upload, ExternalLink, Pencil } from "lucide-react";

interface NurseryActionsProps {
  nurseryId: string;
}

export function NurseryActions({ nurseryId }: NurseryActionsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Link
        href={`/dashboard/nursery/inventory?id=${nurseryId}`}
        className="group rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <Upload className="h-5 w-5 text-green-600" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 group-hover:text-green-600">
          Upload Inventory
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">
          CSV upload or manual entry
        </p>
      </Link>
      <Link
        href={`/nurseries/${nurseryId}`}
        className="group rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <ExternalLink className="h-5 w-5 text-blue-600" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600">
          View Public Page
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">
          See what customers see
        </p>
      </Link>
      <Link
        href={`/dashboard/nursery/profile?id=${nurseryId}`}
        className="group rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <Pencil className="h-5 w-5 text-orange-600" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 group-hover:text-orange-600">
          Edit Profile
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">
          Update nursery details
        </p>
      </Link>
    </div>
  );
}