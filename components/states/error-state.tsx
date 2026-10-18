import { ReactNode } from "react";
import { Card, CardDescription, CardFooter, CardHeader } from "../ui/card";

type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <Card>
      <CardHeader>
        <h2>{title}</h2>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && <CardFooter>{action}</CardFooter>}
    </Card>
  );
}
