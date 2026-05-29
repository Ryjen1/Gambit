"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";

const ChatApp = dynamic(() => import("./ChatApp"), { ssr: false, loading: () => <LoadingScreen /> });

function LoadingScreen() {
  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-base)", color: "var(--text-primary)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div className="font-display" style={{ fontSize: 36, marginBottom: 12 }}>
          <span style={{ color: "var(--text-primary)" }}>GAM</span>
          <span style={{ color: "var(--accent)" }}>BIT</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Loading...</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return <ChatApp />;
}
