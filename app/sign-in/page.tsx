import { SignInForm } from "@/components/auth/sign-in-form";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function SignInPage() {
  return (
    <main className="flex justify-center items-center p-4 min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to ControlDesk</CardTitle>
          <CardDescription>
            Sign in to manage your business operations.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg border bg-muted/50 p-4 text-sm">
            <p className="mb-2 font-medium">Demo login details</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
              <dt>Email:</dt>
              <dd className="font-mono text-foreground">nirmal@gmail.com</dd>
              <dt>Password:</dt>
              <dd className="font-mono text-foreground">nirmal123</dd>
            </dl>
          </div>

          <SignInForm />
        </CardContent>
      </Card>
    </main>
  );
}
