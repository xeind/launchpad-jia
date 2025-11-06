import React from "react";

interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

export default function FormLabel({ children, required }: FormLabelProps) {
  return (
    <span style={{ fontSize: 14, fontWeight: 400, color: "#414651" }}>
      {children}
      {required && <span style={{ color: "#DC2626", marginLeft: 4 }}>*</span>}
    </span>
  );
}
