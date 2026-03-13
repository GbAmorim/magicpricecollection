import React from "react";
import TopBar from "./TopBar";

export default function AppShell({ children }) {
    return (
        <div className="min-h-screen bg-white">
            <TopBar />
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
    );
}
