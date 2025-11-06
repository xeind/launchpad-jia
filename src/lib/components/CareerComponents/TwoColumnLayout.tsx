export default function TwoColumnLayout({
  leftColumn,
  rightColumn,
}: {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 16,
        width: "100%",
        marginTop: 16,
        alignItems: "flex-start",
      }}
    >
      {/* Left column - 60% */}
      <div
        style={{
          width: "60%",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {leftColumn}
      </div>

      {/* Right column - 40% */}
      <div
        style={{
          width: "40%",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {rightColumn}
      </div>
    </div>
  );
}
