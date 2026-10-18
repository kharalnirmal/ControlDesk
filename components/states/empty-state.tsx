import type { ReactNode } from "react";
import { Card, CardDescription, CardFooter, CardHeader } from "../ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-lg">{title}</h2>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      {action && <CardFooter>{action}</CardFooter>}
    </Card>
  );
}
