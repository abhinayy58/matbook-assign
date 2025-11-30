import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  adminFormsKeys,
  deleteForm,
  fetchAdminForms,
} from "../api/forms";
import { AppShell } from "../components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function MyFormsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: adminFormsKeys.all,
    queryFn: fetchAdminForms,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminFormsKeys.all });
    },
  });

  const forms = data ?? [];

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Forms</CardTitle>
          <p className="text-sm text-slate-500">
            Manage all admin-created forms. Use the actions to preview, edit, or review submissions.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading forms...</p>
          ) : forms.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No forms yet. Create one from the builder tab.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {form.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      Updated {new Date(form.updatedAt).toLocaleString()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">v{form.version}</Badge>
                      <Badge variant="outline">
                        Fields: {form.fields.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/preview/${form.id}`}>Preview</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={`/create/${form.id}`}
                        state={{ form }}
                      >
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete form "${form.title}" and all submissions?`
                          )
                        ) {
                          deleteMutation.mutate(form.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
