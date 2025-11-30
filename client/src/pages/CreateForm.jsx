/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createForm,
  fetchAdminForm,
  updateForm,
  adminFormsKeys,
} from "../api/forms";
import { FieldEditor } from "../components/builder/FieldEditor";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { AppShell } from "../components/layout/AppShell";

const defaultField = (type, order) => ({
  name: `${type}_${crypto.randomUUID().slice(0, 6)}`,
  label: `${type[0].toUpperCase()}${type.slice(1)} field`,
  description: "",
  type,
  required: false,
  order,
  options:
    type === "radio" || type === "select"
      ? [
          {
            id: crypto.randomUUID(),
            label: "Option 1",
            value: "option_1",
            nestedFields: [],
          },
        ]
      : type === "checkbox"
      ? []
      : undefined,
  validation: {},
});

const hydrateOptionIds = (fields) =>
  fields.map((field) => ({
    ...field,
    options: field.options?.map((option) => ({
      ...option,
      id: option.id ?? crypto.randomUUID(),
      nestedFields: option.nestedFields
        ? hydrateOptionIds(option.nestedFields)
        : [],
    })),
  }));

const formatBuilderState = (form) => ({
  title: form.title,
  description: form.description,
  fields: hydrateOptionIds(form.fields),
});

const isSameBuilderState = (nextState, prevState) =>
  JSON.stringify(nextState) === JSON.stringify(prevState);

export default function CreateFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const seededForm = location.state?.form;
  const [builder, setBuilder] = useState({
    title: "",
    description: "",
    fields: [],
  });
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!id || !seededForm || seededForm.id !== id) {
      return;
    }
    const nextState = formatBuilderState(seededForm);
    setBuilder((prev) => (isSameBuilderState(nextState, prev) ? prev : nextState));
  }, [id, seededForm]);

  const {
    data: existing,
    isFetching,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: id ? adminFormsKeys.detail(id) : ["builder", "blank"],
    queryFn: () => fetchAdminForm(id),
    enabled: Boolean(id),
    onSuccess: (form) => {
      if (!form) {
        return;
      }
      const nextState = formatBuilderState(form);
      setBuilder((prev) => (isSameBuilderState(nextState, prev) ? prev : nextState));
    },
  });

  const initialLoading = Boolean(
    id && !seededForm && builder.fields.length === 0 && isFetching
  );
  const initialError = Boolean(id && fetchError && builder.fields.length === 0);

  const mutation = useMutation({
    mutationFn: (payload) =>
      id ? updateForm(id, payload) : createForm(payload),
    onSuccess: (nextForm) => {
      queryClient.invalidateQueries({ queryKey: adminFormsKeys.all });
      setBuilder({
        title: nextForm.title,
        description: nextForm.description,
        fields: hydrateOptionIds(nextForm.fields),
      });
      setLocalError(null);
      if (!id) {
        navigate(`/create/${nextForm.id}`, { replace: true });
      }
    },
    onError: (error) => {
      setLocalError(error.message);
    },
  });

  const addField = (type) => {
    setBuilder((prev) => ({
      ...prev,
      fields: [...prev.fields, defaultField(type, prev.fields.length)],
    }));
  };

  const updateField = (index, field) => {
    setBuilder((prev) => {
      const next = [...prev.fields];
      next[index] = field;
      return { ...prev, fields: next };
    });
  };

  const removeField = (index) => {
    setBuilder((prev) => {
      const next = [...prev.fields];
      next.splice(index, 1);
      return { ...prev, fields: next };
    });
  };

  const moveField = (index, direction) => {
    setBuilder((prev) => {
      const next = [...prev.fields];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) {
        return prev;
      }
      const temp = next[targetIndex];
      next[targetIndex] = next[index];
      next[index] = temp;
      return { ...prev, fields: next };
    });
  };

  const assignOrder = (fields) =>
    fields.map((field, index) => ({
      ...field,
      order: index,
      options: field.options?.map((option) => ({
        label: option.label,
        value: option.value,
        nestedFields: option.nestedFields
          ? assignOrder(option.nestedFields)
          : [],
      })),
    }));

  const serialize = () => {
    const normalizedFields = assignOrder(builder.fields);
    return {
      title: builder.title.trim(),
      description: builder.description.trim(),
      fields: normalizedFields,
    };
  };

  const onSubmit = () => {
    if (!builder.title.trim()) {
      setLocalError("Title is required");
      return;
    }
    if (builder.fields.length === 0) {
      setLocalError("Add at least one field");
      return;
    }
    mutation.mutate(serialize());
  };

  const resetBuilder = () => {
    setBuilder({ title: "", description: "", fields: [] });
    setLocalError(null);
    if (id) {
      navigate("/create");
    }
  };

  const fieldTypes = useMemo(
    () => [
      { type: "text", label: "Text" },
      { type: "textarea", label: "Textarea" },
      { type: "number", label: "Number" },
      { type: "email", label: "Email" },
      { type: "date", label: "Date" },
      { type: "checkbox", label: "Checkbox" },
      { type: "radio", label: "Radio" },
      { type: "select", label: "Select" },
    ],
    []
  );

  if (initialLoading) {
    return (
      <AppShell>
        <Card>
          <CardHeader>
            <CardTitle>Loading form...</CardTitle>
            <p className="text-sm text-slate-500">
              Fetching the form schema so you can make edits.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Please wait a moment.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (initialError) {
    return (
      <AppShell>
        <Card>
          <CardHeader>
            <CardTitle>Unable to load form</CardTitle>
            <p className="text-sm text-slate-500">
              {fetchError.message || "Something went wrong fetching this form."}
            </p>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => refetch()}>Try again</Button>
            <Button
              variant="outline"
              onClick={() => navigate("/myforms")}
            >
              Back to forms
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{id ? "Edit form" : "Create a new form"}</CardTitle>
            <p className="text-sm text-slate-500">
              {id
                ? "Update the form schema and hit save when you are ready."
                : "Start by giving your form a name, then add fields using the builder."}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Title
                </label>
                <Input
                  value={builder.title}
                  onChange={(event) =>
                    setBuilder((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="e.g. Customer intake"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <Textarea
                  value={builder.description}
                  onChange={(event) =>
                    setBuilder((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Optional summary for respondents"
                />
              </div>
            </div>

            {localError && (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {localError}
              </p>
            )}

            <div className="space-y-4">
              {builder.fields.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No fields yet. Use the panel on the right to add your first field.
                </div>
              )}
              {builder.fields.map((field, index) => (
                <FieldEditor
                  key={field.name}
                  field={field}
                  onChange={(updated) => updateField(index, updated)}
                  onRemove={() => removeField(index)}
                  onMove={(direction) => moveField(index, direction)}
                  createField={(type) => defaultField(type, 0)}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={onSubmit} disabled={mutation.isPending || isFetching}>
                {mutation.isPending ? "Saving..." : id ? "Save changes" : "Create form"}
              </Button>
              <Button variant="outline" onClick={resetBuilder}>
                Reset
              </Button>
              {existing && (
                <Badge variant="secondary">
                  v{existing.version} • Updated{" "}
                  {new Date(existing.updatedAt).toLocaleString()}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add field</CardTitle>
            <p className="text-sm text-slate-500">
              Choose a type to insert at the end of the form. You can re-order later.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3">
            {fieldTypes.map((entry) => (
              <Button
                key={entry.type}
                variant="outline"
                onClick={() => addField(entry.type)}
              >
                {entry.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
