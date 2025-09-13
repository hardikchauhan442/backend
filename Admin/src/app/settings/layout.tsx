import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Settings | Isha MFG",
  description: "Manage system settings and configurations",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="settings-layout">{children}</div>;
}
