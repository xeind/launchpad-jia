export default function CareerFormCard({
  heading,
  icon,
  iconBgColor = "#181D27",
  children,
  className = "",
  style,
  customIcon,
  headingBadge,
  headingAction,
  isExpanded,
  onToggle,
}: {
  heading: string;
  icon?: string;
  iconBgColor?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  customIcon?: React.ReactNode;
  headingBadge?: React.ReactNode;
  headingAction?: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div
      className={`layered-card-outer ${className}`}
      style={{
        background: "#F8F9FC",
        padding: 8,
        borderRadius: 16,
        ...style,
        marginBottom: 8,
      }}
    >
      {/* Heading section - outside of layered-card-middle */}
      {heading && (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 8,
              paddingLeft: 10,
              paddingTop: 0,
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Chevron toggle button - only show if onToggle is provided */}
              {onToggle && (
                <button
                  onClick={onToggle}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i
                    className={`la la-angle-${isExpanded ? "up" : "down"}`}
                    style={{ fontSize: 20, color: "#6B7280" }}
                  ></i>
                </button>
              )}
              {(icon || customIcon) && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: iconBgColor,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {customIcon || (
                    <i
                      className={icon}
                      style={{
                        color: "#FFFFFF",
                        fontSize: 20,
                      }}
                    ></i>
                  )}
                </div>
              )}
              <span
                style={{
                  fontSize: 16,
                  color: "#181D27",
                  fontWeight: 700,
                }}
              >
                {heading}
              </span>
              {headingBadge}
            </div>
            {headingAction}
          </div>
        </div>
      )}

      {/* Content wrapper with middle layer - hide when collapsed */}
      {(!onToggle || isExpanded) && (
        <div className="layered-card-middle" style={{ borderRadius: 12 }}>
          <div className="layered-card-content" style={{ borderRadius: 12 }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
