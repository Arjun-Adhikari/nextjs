"use server";

import * as z from "zod";
import {
  SignupFormSchema,
  LoginFormSchema,
  type FormState,
} from "../definations";

export async function signup(
  data: z.infer<typeof SignupFormSchema>,
): Promise<FormState> {
  const validatedFields = SignupFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  // TODO: persist user and create a session.
  return { message: "Account created successfully. Check your email to confirm." };
}

export async function login(
  data: z.infer<typeof LoginFormSchema>,
): Promise<FormState> {
  const validatedFields = LoginFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  // TODO: verify credentials and create a session.
  return { message: "You are logged in." };
}