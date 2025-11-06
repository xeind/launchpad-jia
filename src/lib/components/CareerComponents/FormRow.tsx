import React from "react";

interface FormRowProps {
  children: React.ReactNode;
}

const FormRow: React.FC<FormRowProps> = ({ children }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
      {children}
    </div>
  );
};

export default FormRow;
