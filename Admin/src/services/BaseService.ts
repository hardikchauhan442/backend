"use client";

import { decrypt } from "@/utils/enc-dec";
import axios from "axios";

const unauthorizedCode = [401];

const BaseService = axios.create({
  timeout: 120000,
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

// Set up interceptors immediately when the service is created
BaseService.interceptors.request.use(
  (config) => {
    const rawPersistData =
      typeof window !== "undefined" ? localStorage.getItem("root") : null;

    let accessToken = localStorage.getItem("authToken") || "";
    const userString =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (userString) {
      try {
        const user = JSON.parse(userString);
        accessToken = user?.token;
      } catch (e) {
        console.error("Invalid user data in localStorage:", e);
      }
    }

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    config.headers["Access-Control-Allow-Origin"] = "*";
    config.headers["ngrok-skip-browser-warning"] = true;

    return config;
  },
  (error) => Promise.reject(error)
);

BaseService.interceptors.response.use(
  (response) => {
    if (response?.data?.data) {
      try {
        // Decrypt the data
        response.data.data = decrypt(response.data.data);
      } catch (error) {
        console.error("Decryption failed:", error);
        // Don't modify response.data.data if decryption fails
      }
    }
    return response;
  },
  (error) => {
    const { response } = error;
    if (response && unauthorizedCode.includes(response.status)) {
      // Optional: dispatch logout action here
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("root");
        // Redirect to login or dispatch logout action
      }
    }
    return Promise.reject(error);
  }
);

// Remove the setUpBaseServiceInterceptors function since we're setting up interceptors directly
export default BaseService;
