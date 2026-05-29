"use client";

import dynamic from "next/dynamic";

const AomiChat = dynamic(() => import("./AomiChat"), {
  ssr: false,
  loading: () => (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#080c10", color: "#f5f7fa",
    }}>
      <div style={{ textAlign: "center" }}>
        <div className="font-display" style={{ fontSize: 36, marginBottom: 12 }}>
          <span>GAM</span><span style={{ color: "#3b82f6" }}>BIT</span>
        </div>
        <p style={{ fontSize: 12, color: "#8b91a3" }}>Loading...</p>
      </div>
    </div>
  ),
});

export default function ChatPage() {
  return <AomiChat />;
}
