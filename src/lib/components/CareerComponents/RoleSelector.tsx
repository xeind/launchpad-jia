"use client";

import { useState, useEffect, useRef } from "react";

interface RoleOption {
  value: string;
  label: string;
  description?: string;
}

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: RoleOption[];
  placeholder?: string;
}

export default function RoleSelector({
  value,
  onChange,
  options,
  placeholder = "Select role",
}: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        type="button"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <i
          className={`la la-angle-${isOpen ? "up" : "down"} text-gray-500`}
        ></i>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 z-50 mb-1 w-full min-w-[320px] rounded-lg border border-gray-300 bg-white shadow-lg">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                  option.value === value
                    ? "bg-indigo-50 font-medium text-indigo-700"
                    : "text-gray-700"
                }`}
                title={option.description}
              >
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="mt-1 text-xs leading-relaxed text-gray-500">
                      {option.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
