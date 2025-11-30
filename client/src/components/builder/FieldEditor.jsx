import { Trash2, Plus, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

const fieldTypes = [
  { label: "Text", value: "text" },
  { label: "Textarea", value: "textarea" },
  { label: "Number", value: "number" },
  { label: "Email", value: "email" },
  { label: "Date", value: "date" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Radio", value: "radio" },
  { label: "Select", value: "select" },
];

function updateOption(options = [], index, patch) {
  const cloned = [...options];
  cloned[index] = { ...cloned[index], ...patch };
  return cloned;
}

export function FieldEditor({
  field,
  onChange,
  onRemove,
  onMove,
  createField,
  depth = 0,
}) {
  const requiresOptions = ["radio", "select", "checkbox"].includes(field.type);

  const setOption = (index, patch) => {
    onChange({
      ...field,
      options: updateOption(field.options || [], index, patch),
    });
  };

  const addOption = () => {
    const newOption = {
      id: crypto.randomUUID(),
      label: `Option ${field.options?.length ? field.options.length + 1 : 1}`,
      value: `value_${Date.now()}`,
      nestedFields: [],
    };
    onChange({
      ...field,
      options: [...(field.options || []), newOption],
    });
  };

  const removeOption = (index) => {
    const next = [...(field.options || [])];
    next.splice(index, 1);
    onChange({ ...field, options: next });
  };

  const addNestedField = (optionIndex) => {
    const nextField = createField("text");
    const next = updateOption(field.options || [], optionIndex, {
      nestedFields: [
        ...((field.options?.[optionIndex].nestedFields) || []),
        nextField,
      ],
    });
    onChange({ ...field, options: next });
  };

  const updateNestedField = (optionIndex, nestedIndex, nestedField) => {
    const options = [...(field.options || [])];
    const nested = [...(options[optionIndex].nestedFields || [])];
    nested[nestedIndex] = nestedField;
    options[optionIndex] = { ...options[optionIndex], nestedFields: nested };
    onChange({ ...field, options });
  };

  const removeNestedField = (optionIndex, nestedIndex) => {
    const options = [...(field.options || [])];
    const nested = [...(options[optionIndex].nestedFields || [])];
    nested.splice(nestedIndex, 1);
    options[optionIndex] = { ...options[optionIndex], nestedFields: nested };
    onChange({ ...field, options });
  };

  return (
    <Card
      className={cn("border-slate-200 shadow-sm", {
        "ml-6 border-dashed": depth > 0,
      })}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-slate-400" />
          <CardTitle className="text-base">{field.label || "Untitled"}</CardTitle>
          <Badge variant="secondary">{field.type}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {onMove && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMove("up")}
                title="Move up"
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMove("down")}
                title="Move down"
              >
                ↓
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            title="Remove field"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${field.name}-label`}>Label</Label>
            <Input
              id={`${field.name}-label`}
              value={field.label}
              onChange={(event) =>
                onChange({ ...field, label: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${field.name}-name`}>Field name</Label>
            <Input
              id={`${field.name}-name`}
              value={field.name}
              onChange={(event) =>
                onChange({ ...field, name: event.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${field.name}-description`}>Description</Label>
          <Textarea
            id={`${field.name}-description`}
            value={field.description || ""}
            onChange={(event) =>
              onChange({ ...field, description: event.target.value })
            }
            rows={2}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={field.type}
              onValueChange={(value) => {
                onChange({
                  ...field,
                  type: value,
                  options:
                    value === "select" || value === "radio" || value === "checkbox"
                      ? field.options && field.options.length > 0
                        ? field.options
                        : [
                            {
                              id: crypto.randomUUID(),
                              label: "Option 1",
                              value: "option_1",
                              nestedFields: [],
                            },
                          ]
                      : undefined,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose type" />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Required</Label>
            <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3">
              <Switch
                checked={field.required}
                onCheckedChange={(checked) =>
                  onChange({ ...field, required: checked })
                }
                id={`${field.name}-required`}
              />
              <Label htmlFor={`${field.name}-required`} className="text-sm font-normal">
                This field is required
              </Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Order</Label>
            <Input
              type="number"
              value={field.order}
              onChange={(event) =>
                onChange({ ...field, order: Number(event.target.value) })
              }
              min={0}
            />
          </div>
        </div>

        {(field.type === "text" ||
          field.type === "textarea" ||
          field.type === "number") && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Min</Label>
              <Input
                type="number"
                value={field.validation?.min ?? ""}
                onChange={(event) =>
                  onChange({
                    ...field,
                    validation: {
                      ...field.validation,
                      min:
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Max</Label>
              <Input
                type="number"
                value={field.validation?.max ?? ""}
                onChange={(event) =>
                  onChange({
                    ...field,
                    validation: {
                      ...field.validation,
                      max:
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                    },
                  })
                }
              />
            </div>
            {(field.type === "text" || field.type === "textarea") && (
              <div className="space-y-2">
                <Label>Regex</Label>
                <Input
                  value={field.validation?.regex ?? ""}
                  onChange={(event) =>
                    onChange({
                      ...field,
                      validation: {
                        ...field.validation,
                        regex:
                          event.target.value === ""
                            ? undefined
                            : event.target.value,
                      },
                    })
                  }
                  placeholder="/pattern/"
                />
              </div>
            )}
          </div>
        )}

        {requiresOptions && (
          <div className="space-y-3 rounded-lg border border-dashed border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Options</p>
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="mr-2 h-4 w-4" /> Add option
              </Button>
            </div>

            {(field.options || []).map((option, index) => (
              <div key={option.id} className="rounded-md border border-slate-100 p-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={option.label}
                      onChange={(event) =>
                        setOption(index, { label: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      value={option.value}
                      onChange={(event) =>
                        setOption(index, { value: event.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => removeOption(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Nested fields
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => addNestedField(index)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add nested field
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(option.nestedFields || []).map((nestedField, nestedIndex) => (
                      <FieldEditor
                        key={nestedField.name}
                        field={nestedField}
                        onChange={(updated) =>
                          updateNestedField(index, nestedIndex, updated)
                        }
                        onRemove={() => removeNestedField(index, nestedIndex)}
                        createField={createField}
                        depth={depth + 1}
                      />
                    ))}
                    {option.nestedFields?.length === 0 && (
                      <p className="text-xs text-slate-500">
                        No nested fields. Click &ldquo;Add nested field&rdquo; to attach
                        follow-up questions when this option is selected.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

