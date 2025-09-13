import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Quality Control | Isha MFG",
  description:
    "Quality control and inspection management for jewelry manufacturing",
};

export default function QualityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="quality-module">{children}</div>;
}
