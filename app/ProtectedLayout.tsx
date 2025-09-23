// app/ProtectedLayout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    const user = sessionStorage.getItem("demoUserId");

    if (!user || user === "undefined") {
      router.push("/login");
    }
  }, [router]);

  return <>{children}</>;
}
