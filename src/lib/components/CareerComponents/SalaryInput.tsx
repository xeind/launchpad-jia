import React from "react";

interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

interface SalaryInputProps {
  value: string;
  onChange: (value: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  currencyOptions: CurrencyOption[];
  formatNumberWithCommas: (value: string) => string;
  parseNumberFromFormatted: (value: string) => string;
}

const SalaryInput: React.FC<SalaryInputProps> = ({
  value,
  onChange,
  showDropdown,
  setShowDropdown,
  currency,
  setCurrency,
  currencyOptions,
  formatNumberWithCommas,
  parseNumberFromFormatted,
}) => {
  return (
    <div style={{ position: "relative" }} data-currency-dropdown>
      <span
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#6c757d",
          fontSize: "16px",
          pointerEvents: "none",
        }}
      >
        {currencyOptions.find((c) => c.code === currency)?.symbol || "₱"}
      </span>
      <input
        type="text"
        className="form-control"
        style={{ paddingLeft: "28px", paddingRight: "70px" }}
        placeholder="0"
        value={formatNumberWithCommas(value)}
        onChange={(e) => {
          const rawValue = parseNumberFromFormatted(e.target.value);
          onChange(rawValue);
        }}
      />
      <button
        type="button"
        style={{
          position: "absolute",
          right: "8px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "14px",
          background: "#FFF",
          border: "1px solid #FFF",
          borderRadius: "6px",
          padding: "4px 8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontWeight: 500,
        }}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {currency}
        <i className="la la-angle-down" style={{ fontSize: "14px" }}></i>
      </button>
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: "0",
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            minWidth: "180px",
          }}
        >
          {currencyOptions.map((curr) => (
            <div
              key={curr.code}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                background:
                  currency === curr.code ? "#F9FAFB" : "#FFFFFF",
                borderBottom: "1px solid #F3F4F6",
              }}
              onClick={() => {
                setCurrency(curr.code);
                setShowDropdown(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  currency === curr.code ? "#F9FAFB" : "#FFFFFF";
              }}
            >
              <span style={{ fontWeight: 600, width: "20px" }}>
                {curr.symbol}
              </span>
              <span style={{ fontWeight: 500 }}>{curr.code}</span>
              <span style={{ color: "#6B7280", fontSize: "12px" }}>
                - {curr.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalaryInput;
