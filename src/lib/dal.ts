import "server-only";

import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const verifySession = cache(async () => {
  const session = await auth();
  if (!session.userId) redirect("/auth/sign-in");
  return session;
});