import React from "react";
import { AppShell } from "../components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { adminFormsKeys, fetchAdminForms } from "../api/forms";
import DataTable from "../components/ui/DataTable";

export default function AllForms() {
  // Ensure data is always an array
  const { data = [], isLoading, isError } = useQuery({
    queryKey: adminFormsKeys.all,
    queryFn: fetchAdminForms,
  });

  console.log("FORMS DATA:", data);

  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Total Fields",
      accessorKey: "fields.length",
    },
        {
      header: "Versions",
      accessorKey: "version",
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ getValue }) => {
        const val = getValue();
        return val ? new Date(val).toLocaleDateString() : "";
      },
    },
    {
    header: "Actions",
    cell: ({ row }) => {
      const id = row.original.id; // <- IMPORTANT
      return (
        <a
          href={`/submissions/${id}`}
          className="text-blue-600 hover:underline"
        >
          View
        </a>
      );
    },
  },
  ];

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-4">All Forms</h1>

      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-red-600">Failed to fetch forms.</p>}

      {!isLoading && !isError && (
        <DataTable columns={columns} data={data} />
      )}
    </AppShell>
  );
}
