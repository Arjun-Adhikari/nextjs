import { usersQuery } from "../../lib/users-db";

type User = {
  id: number;
  rollno: number;
  firstname: string;
  lastname: string;
  email: string;
  address: string | null;
  created_at: Date;
};

export const metadata = {
  title: "Users - Todo App",
};

export default async function UsersPage() {
  const { rows } = await usersQuery<User>(
    "SELECT id, rollno, firstname, lastname, email, address, created_at FROM users ORDER BY id",
  );

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-xl font-bold">Users (arjun_adhikari)</h1>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border p-2">ID</th>
            <th className="border p-2">Roll No</th>
            <th className="border p-2">First Name</th>
            <th className="border p-2">Last Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Address</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border p-2">{row.id}</td>
              <td className="border p-2">{row.rollno}</td>
              <td className="border p-2">{row.firstname}</td>
              <td className="border p-2">{row.lastname}</td>
              <td className="border p-2">{row.email}</td>
              <td className="border p-2">{row.address}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-gray-500">
        {rows.length} row(s) loaded from the arjun_adhikari database.
      </p>
    </div>
  );
}