import { Suspense } from "react";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";

export default function Home() {
  return (
    <div className="max-w-xs mx-auto p-4 flex flex-col items-center gap-4">
      <h1 className="text-xl font-bold">Todo App</h1>

      <TodoForm />

      <Suspense
        fallback={
          <div className="flex flex-col gap-3 w-full">
            <h2 className="text-lg font-semibold text-center">Lists of todos</h2>
            <p className="text-sm text-gray-500 text-center">Loading...</p>
          </div>
        }
      >
        <TodoList />
      </Suspense>
    </div>
  );
}
