import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchPublicForm,
  fetchPublicForms,
  submitPublicForm,
} from "../api/forms";
import { AppShell } from "../components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { FormRenderer } from "../components/forms/FormRenderer";
import { Button } from "../components/ui/button";

export default function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manualFormId, setManualFormId] = useState("");
  const [message, setMessage] = useState(null);
  const selectedFormId = id ?? manualFormId;

  const { data: formsList } = useQuery({
    queryKey: ["public", "forms", "list"],
    queryFn: fetchPublicForms,
  });

  const { data: activeForm, isFetching: loadingForm } = useQuery({
    queryKey: ["public", "forms", selectedFormId],
    queryFn: () => fetchPublicForm(selectedFormId),
    enabled: Boolean(selectedFormId),
  });

  const submitMutation = useMutation({
    mutationFn: (values) => submitPublicForm(selectedFormId, values),
    onSuccess: () => {
      setMessage("Submission stored successfully");
    },
    onError: (error) => {
      setMessage(error.message);
    },
  });

  const formOptions =
    formsList?.map((form) => ({
      value: form.id,
      label: form.title,
    })) ?? [];

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Fill a form</CardTitle>
          <p className="text-sm text-slate-500">
            Browse every published form, complete it, and submit your response directly from this page.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Select form</p>
            <Select
              value={selectedFormId}
              onValueChange={(value) => {
                setMessage(null);
                if (id) {
                  navigate(`/forms/${value}`);
                  return;
                }
                setManualFormId(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a form" />
              </SelectTrigger>
              <SelectContent>
                {formOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!selectedFormId && (
            <p className="text-sm text-slate-500">
              Pick a form to load the questions and send in your answers.
            </p>
          )}

          {selectedFormId && loadingForm && (
            <p className="text-sm text-slate-500">Loading form...</p>
          )}

          {selectedFormId && !loadingForm && activeForm && (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {activeForm.title}
                </p>
                {activeForm.description && (
                  <p className="text-sm text-slate-500">
                    {activeForm.description}
                  </p>
                )}
              </div>
              {message && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                  {message}
                </div>
              )}
              <FormRenderer
                form={activeForm}
                onSubmit={(values) => submitMutation.mutateAsync(values)}
                isSubmitting={submitMutation.isPending}
              />
            </div>
          )}

          {selectedFormId && !loadingForm && !activeForm && (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Could not load this form. It may have been deleted.
            </div>
          )}

          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setMessage(null);
                if (id) {
                  navigate("/forms", { replace: true });
                  return;
                }
                setManualFormId("");
              }}
              disabled={!selectedFormId}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
