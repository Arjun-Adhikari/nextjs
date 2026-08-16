"use server";
import db from "../db";
export async function createTodo(prevState: any, formData: FormData) {
  const savedData = await db.insert(todos).values({
    firstname: formData.get("firstname"),
    lastname: formData.get("lastname"),
    photourl: formData.get("photourl"),
  });
}
