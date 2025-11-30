import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminForm, fetchSubmissions } from "../api/forms";
import { AppShell } from "../components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function SubmissionsPage() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: form } = useQuery({
    queryKey: ["admin", "forms", id],
    queryFn: () => fetchAdminForm(id),
    enabled: Boolean(id),
  });

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin", "forms", id, "submissions", page],
    queryFn: () => fetchSubmissions(id, page, pageSize),
    enabled: Boolean(id),
  });

  if (!id) {
    return (
      <AppShell>
        <div className="text-center py-20 text-gray-500">
          <p>No form selected.</p>
        </div>
      </AppShell>
    );
  }

  const totalPages = submissions
    ? Math.ceil(submissions.total / submissions.pageSize)
    : 1;

  return (
    <AppShell>
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Submissions for {form?.title ?? "…"}
          </CardTitle>
          <p className="text-sm text-gray-500">
            Showing the most recent responses. Use pagination below to navigate.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Loading */}
          {isLoading && (
            <p className="text-center text-gray-500">Loading submissions…</p>
          )}

          {/* No submissions */}
          {!isLoading && submissions?.items?.length === 0 && (
            <p className="text-center text-gray-500">No submissions yet.</p>
          )}

          {/* Submission list */}
          {!isLoading && submissions?.items?.length > 0 && (
            <div className="space-y-4">
              {submissions.items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      Submission #{item.id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <pre className="mt-3 overflow-x-auto rounded-md bg-gray-900/90 p-3 text-xs text-gray-100">
                    {JSON.stringify(item.answers, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {submissions && submissions.total > submissions.pageSize && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((c) => Math.max(1, c - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((c) => (c >= totalPages ? c : c + 1))
                }
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
