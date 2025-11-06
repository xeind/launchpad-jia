import React from "react";

interface FormSectionHeaderProps {
  children: React.ReactNode;
  marginTop?: number;
}

export default function FormSectionHeader({ children, marginTop = 8 }: FormSectionHeaderProps) {
  return (
    <span
      style={{
        fontSize: 16,
        color: "#181D27",
        fontWeight: 700,
        marginTop,
      }}
    >
      {children}
    </span>
  );
}
