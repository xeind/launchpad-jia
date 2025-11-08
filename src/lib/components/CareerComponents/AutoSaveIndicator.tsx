"use client";

import { useEffect, useState } from "react";
import { useCareerFormStore } from "@/lib/hooks/useCareerFormStore";

export default function AutoSaveIndicator() {
  const { isDirty, isSaving, lastSaved, saveError, autoSave } =
    useCareerFormStore();
  const [timeAgo, setTimeAgo] = useState("");

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (isDirty && !isSaving) {
      const timer = setTimeout(() => {
        autoSave();
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [isDirty, isSaving, autoSave]);

  // Update time ago every minute
  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastSaved) {
        setTimeAgo("");
        return;
      }

      const now = new Date();
      const diff = now.getTime() - new Date(lastSaved).getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        setTimeAgo(`${days} day${days > 1 ? "s" : ""} ago`);
      } else if (hours > 0) {
        setTimeAgo(`${hours} hour${hours > 1 ? "s" : ""} ago`);
      } else if (minutes > 0) {
        setTimeAgo(`${minutes} minute${minutes > 1 ? "s" : ""} ago`);
      } else {
        setTimeAgo("just now");
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastSaved]);

  if (saveError) {
    return (
      <div className="group relative inline-flex items-center">
        <i className="la la-exclamation-circle text-red-600 text-base"></i>
        <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10 whitespace-nowrap bg-gray-900 text-white text-xs rounded py-1 px-2">
          Failed to save: {saveError}
        </div>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="group relative inline-flex items-center">
        <div className="spinner-border spinner-border-sm text-blue-600" role="status" style={{ width: 14, height: 14 }}>
          <span className="sr-only">Saving...</span>
        </div>
        <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10 whitespace-nowrap bg-gray-900 text-white text-xs rounded py-1 px-2">
          Saving changes...
        </div>
      </div>
    );
  }

  if (isDirty) {
    return (
      <div className="group relative inline-flex items-center">
        <i className="la la-circle text-amber-500 text-xs"></i>
        <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10 whitespace-nowrap bg-gray-900 text-white text-xs rounded py-1 px-2">
          Unsaved changes
        </div>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="group relative inline-flex items-center">
        <i className="la la-check-circle text-green-600 text-base"></i>
        <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10 whitespace-nowrap bg-gray-900 text-white text-xs rounded py-1 px-2">
          Saved {timeAgo}
        </div>
      </div>
    );
  }

  return null;
}
