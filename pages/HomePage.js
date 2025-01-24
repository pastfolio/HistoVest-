"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial", textAlign: "center" }}>
      {/* Title */}
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>
        Welcome to HistoVest
      </h1>
      <p style={{ fontSize: "16px", marginBottom: "20px" }}>
        Explore historical stock data and simulations with ease!
      </p>

      {/* Blue Button: Go to Stock Lookup */}
      <div style={{ marginBottom: "10px" }}>
        <Link href="/stock-lookup">
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Go to Stock Lookup
          </button>
        </Link>
      </div>

      {/* Green Button: Go to Historical Simulator */}
      <div>
        <Link href="/simulator">
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Go to Historical Simulator
          </button>
        </Link>
      </div>
    </div>
  );
}
