"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Loader from "@/components/shared/loader";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // renamed to loading for clarity

  useEffect(() => {
    const token = Cookies.get("access_token");

    // Decide where to go
    if (!token) {
      router.replace("/login");
    } else {
      router.replace("/dashboard");
    }

    // After redirect triggered, stop showing loader (in case redirect fails)
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [router]);

  // ✅ Fullscreen loader while deciding route
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <Loader />
      </div>
    );
  }

  return null; // page never shows, we redirect immediately
}