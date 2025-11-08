import React from "react";

interface FormSectionHeaderProps {
  children: React.ReactNode;
  marginBottom?: number;
}

export default function FormSectionHeader({
  children,
  marginBottom = 12,
}: FormSectionHeaderProps) {
  return (
    <span
      style={{
        fontSize: 16,
        color: "#181D27",
        fontWeight: 700,
        marginBottom,
      }}
    >
      {children}
    </span>
  );
}
