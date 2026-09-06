"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { query } from "../db";

// 1. Define server-side validation
const todoSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  photokey: z.string().min(1, "Photo key is required"),
});

export async function createTodo(formData: FormData) {
  try {
    // 2. Extract and validate data
    const validatedFields = todoSchema.safeParse({
      firstname: formData.get("firstname"),
      lastname: formData.get("lastname"),
      photokey: formData.get("photokey"),
    });

    if (!validatedFields.success) {
      return { error: "Invalid data provided." };
    }

    const { firstname, lastname, photokey } = validatedFields.data;

    // 3. Execute secure database query
    const savedData = await query(
      "INSERT INTO users (firstname, lastname, photo) VALUES ($1, $2, $3) RETURNING *",
      [firstname, lastname, photokey],
    );

    // 4. Purge Next.js cache so the UI updates immediately
    // Replace "/" with the actual path where your list is displayed
    revalidatePath("/"); 

    return { success: true, data: savedData.rows[0] };
    
  } catch (error) {
    console.error("Database Mutation Error:", error);
    // Don't leak raw database errors to the client
    return { error: "Failed to save entry to the database." };
  }
}