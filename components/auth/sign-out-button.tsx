"use client";

import { authClient } from "@/lib/auth.client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignout() {
    setPending(true);
    setError(null);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError("Unable to sign out. Please try again.");
        return;
      }
      router.replace("/sign-in");
      router.refresh();
    } catch (error) {
      setError("Unable to sign out. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={handleSignout}
      >
        {" "}
        {pending ? "Signing out..." : "Sign out"}
      </Button>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
