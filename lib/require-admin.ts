import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const adminAccess = await prisma.adminAccess.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      userId: true,
    },
  });

  if (!adminAccess) {
    redirect("/access-denied");
  }

  return session.user;
}
