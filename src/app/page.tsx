// import Image from "next/image";
"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// import Btn from "../components/Btn";
// type is used when you want to declare primitives, unions and intersections. Declare interface when you wanted to declare the objects in oop format.
//
const formSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  photo: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, "Photo is required")
    .refine(
      (files) => files?.[0]?.size <= 5 * 1024 * 1024,
      "Max file size is 5MI",
    ),
});

type IFormInput = z.infer<typeof formSchema>;

export default function SimpleForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: zodResolver(formSchema), //it handles the connection between react-hook-form and the zod schema right.(acts as a bridge between them).
  });
  const onSubmit: SubmitHandler<IFormInput> = (data) => console.log(data);

  return (
    <div className="max-w-xs mx-auto p-4 flex flex-col items-center gap-4">
      <h1 className="text-xl font-bold">Todo App</h1>

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
          {errors.firstName && <span>{errors.firstName.message}</span>}
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
          {errors.lastName && <span>{errors.lastName.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="photo" className="text-sm">
            Add Photo
          </label>
          <input
            type="file"
            id="photo"
            {...register("photo")}
            className="text-sm"
          />
          {errors.photo && <span>{errors.photo.message}</span>}
        </div>

        <input
          type="submit"
          className="bg-black text-white p-2 rounded mt-2 hover:cursor-pointer"
        />
      </form>

      <div className="flex flex-col gap-5">
        <div>
          <h1 className="flex justify-center">Lists of todos</h1>
        </div>
        <div className="flex gap-10">
          <h1>SN</h1>
          {/* <image>Image</image> */}
          <span>Firstname</span>
          <span>Lastname</span>
        </div>
      </div>
    </div>
  );
}
