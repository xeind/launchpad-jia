import React from "react";

interface FormSectionHeaderProps {
  children: React.ReactNode;
  marginBottom?: number;
  marginTop?: number;
}

export default function FormSectionHeader({
  children,
  marginBottom = 12,
  marginTop = 8,
}: FormSectionHeaderProps) {
  return (
    <span
      style={{
        fontSize: 16,
        color: "#181D27",
        fontWeight: 700,
        marginBottom,
        marginTop,
      }}
    >
      {children}
    </span>
  );
}
