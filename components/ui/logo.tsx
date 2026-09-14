"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { apiClient } from "@/lib/axios";

interface AppLogoProps {
  userRole?: "master" | "seller";
  isCollapsed?: boolean;
}

export function Logo({ userRole = "master", isCollapsed = false }: AppLogoProps) {
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await apiClient.get("/settings");
        const general = response.data?.data?.general;
        if (general?.logo) {
          setLogoPath(general.logo);
        }
      } catch (err) {
        console.error("Failed to fetch platform logo:", err);
      } finally {
        setLoaded(true);
      }
    };

    fetchLogo();
  }, []);

  // Return nothing while loading or if no logo is provided by the endpoint
  if (!loaded || !logoPath) {
    return null;
  }

  // Construct backend storage URL if a logo exists
  const backendUrl = process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:8000";
  const dynamicLogoUrl = logoPath.startsWith("http") ? logoPath : `${backendUrl}/${logoPath}`;

  if (isCollapsed) {
    return (
      <Image
        src={dynamicLogoUrl}
        alt="Logo Icon"
        width={32}
        height={32}
        className="max-w-none object-contain size-8"
        unoptimized={true}
      />
    );
  }

  return (
    <Image
      src={dynamicLogoUrl}
      alt="Platform Logo"
      width={114}
      height={37}
      className="max-w-none object-contain h-[37px] w-auto"
      unoptimized={true}
    />
  );
}