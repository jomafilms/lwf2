"use client";

import { useRef } from "react";
import { Building2, Upload, Loader2 } from "lucide-react";

interface LogoUploadFormProps {
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LogoUploadForm({ uploading, onUpload }: LogoUploadFormProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Logo & Branding
      </h2>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          {/* TODO: Show current logo if exists */}
          <Building2 className="h-8 w-8 text-gray-400" />
        </div>
        <div>
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Logo
          </button>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG up to 5MB. Recommended: 200x200px or square format.
          </p>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}