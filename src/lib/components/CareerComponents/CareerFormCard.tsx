export default function CareerFormCard({
  heading,
  icon,
  iconBgColor = "#181D27",
  children,
  className = "",
  style,
  customIcon,
}: {
  heading: string;
  icon?: string;
  iconBgColor?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  customIcon?: React.ReactNode;
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
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: 8,
            paddingLeft: 10,
            paddingTop: 0,
            gap: 12,
          }}
        >
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
                    fontSize: 20 
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
        </div>
      </div>

      {/* Content wrapper with middle layer */}
      <div className="layered-card-middle" style={{ borderRadius: 12 }}>
        <div className="layered-card-content" style={{ borderRadius: 12 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
