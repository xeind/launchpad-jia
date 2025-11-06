import React from "react";

interface FormFieldProps {
  children: React.ReactNode;
  flex?: number;
}

/**
 * FormField - Wrapper component for form inputs and dropdowns
 * Provides consistent vertical spacing (gap: 8px) between label and input
 */
export default function FormField({ children, flex = 1 }: FormFieldProps) {
  return (
    <div
      style={{
        flex,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}
