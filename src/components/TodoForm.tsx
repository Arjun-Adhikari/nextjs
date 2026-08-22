"use client";

import axios from "axios";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { createTodo } from "../lib/actions/todos";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const formSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),

  photo: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, "Photo is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Maximum file size is 5 MB",
    )
    .refine(
      (files) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(
          files?.[0]?.type,
        ),
      "Only JPG, PNG, and PDF files are allowed",
    ),
});

type IFormInput = z.infer<typeof formSchema>;

export default function TodoForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      setIsUploading(true);
      setServerError("");

      const file = data.photo[0];

      if (!file) {
        throw new Error("Please select a file");
      }

      const presignResponse = await axios.post(
        "/api/uploads/presign",
        {
          filename: file.name,
          contentType: file.type,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!presignResponse) {
        throw new Error("Failed to generate upload URL");
      }

      const { uploadUrl, key } = await presignResponse.data;

      const uploadResponse = await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse) {
        throw new Error("Failed to upload file to S3");
      }

      const formData = new FormData();

      formData.append("firstname", data.firstName);
      formData.append("lastname", data.lastName);
      formData.append("photokey", key);

      await createTodo(null, formData);

      reset();
    } catch (error) {
      console.error(error);

      setServerError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-3 w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="firstName" className="text-sm">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          className="border p-1.5 rounded"
          {...register("firstName")}
        />
        {errors.firstName && (
          <span className="text-red-500 text-sm">
            {errors.firstName.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="lastName" className="text-sm">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          className="border p-1.5 rounded"
          {...register("lastName")}
        />
        {errors.lastName && (
          <span className="text-red-500 text-sm">
            {errors.lastName.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="photo" className="text-sm">
          Add Photo
        </label>
        <input
          type="file"
          id="photo"
          accept="image/jpeg,image/png,application/pdf"
          {...register("photo")}
          className="text-sm"
        />
        {errors.photo && (
          <span className="text-red-500 text-sm">{errors.photo.message}</span>
        )}
      </div>

      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

      <button
        type="submit"
        disabled={isUploading}
        className="bg-black text-white p-2 rounded mt-2 disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Submit"}
      </button>
    </form>
  );
}
