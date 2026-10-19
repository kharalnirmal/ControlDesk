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

        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </main>
  );
}
