import { SignOutButton } from "@/components/auth/sign-out-button";

export default function AccessDeniedPage() {
  return (
    <main className="flex flex-col justify-center items-center gap-4 p-6 min-h-screen text-center">
      <h1 className="font-semibold text-2xl">Access denied</h1>

      <p className="max-w-md text-muted-foreground">
        Your account is signed in, but it does not have permission to access
        ControlDesk.
      </p>

      <SignOutButton />
    </main>
  );
}
