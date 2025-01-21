"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Welcome to the Stock Analysis Platform</h1>
      <p>Select an option:</p>
      <div>
        <Link href="/simulator">
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
            Go to Simulator
          </button>
        </Link>
      </div>
    </div>
  );
}
