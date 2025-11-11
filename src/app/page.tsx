"use client";
import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // Redirect to login page on mount
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  // Optional: Show a loading state while redirecting
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2>Redirecting to login...</h2>
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
}
