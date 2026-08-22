import { query } from "../lib/db";

type TodoRow = {
  id: number;
  firstname: string;
  lastname: string;
  photo: string | null;
};

export default async function TodoList() {
  const { rows } = await query<TodoRow>(
    "SELECT id, firstname, lastname, photo FROM users ORDER BY id",
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      <h2 className="text-lg font-semibold text-center">Lists of todos</h2>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 text-center">No todos yet</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-1.5">SN</th>
              <th className="border p-1.5">Firstname</th>
              <th className="border p-1.5">Lastname</th>
              <th className="border p-1.5">Photo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id}>
                <td className="border p-1.5">{i + 1}</td>
                <td className="border p-1.5">{row.firstname}</td>
                <td className="border p-1.5">{row.lastname}</td>
                <td className="border p-1.5">{row.photo || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
