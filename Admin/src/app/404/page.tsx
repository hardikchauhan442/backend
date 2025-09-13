"use client";

import React from "react";
import { Result, Button } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { appConfig } from "@/config/app.config";

export default function NotFoundPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleGoHome = () => {
    const redirectTo = isAuthenticated 
      ? appConfig.routes.authenticatedEntryPath 
      : appConfig.routes.unauthenticatedEntryPath;
    router.push(redirectTo);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <div className="space-x-2">
            <Button type="primary" onClick={handleGoHome}>
              Back Home
            </Button>
            <Button onClick={handleGoBack}>
              Go Back
            </Button>
          </div>
        }
      />
    </div>
  );
}
