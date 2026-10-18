"use client";

import { ErrorState } from "@/components/states/error-state";
import { Button } from "@base-ui/react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ reset }: ErrorProps) {
  return (
    <ErrorState
      title="Something went wrong"
      description="Try Again"
      action={<Button onClick={reset}> reset</Button>}
    />
  );
}
