"use server";
import { query } from "../db";

export async function createTodo(prevState: any, formData: FormData) {
  const savedData = await query(
    "INSERT INTO users (firstname, lastname, photo) VALUES ($1, $2, $3) RETURNING *",
    [
      formData.get("firstname"),
      formData.get("lastname"),
      formData.get("photokey"),
    ],
  );
  return savedData.rows;
}   