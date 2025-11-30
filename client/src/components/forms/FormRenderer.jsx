import { useEffect, useMemo, useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export function FormRenderer({ form, onSubmit, isSubmitting }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [lastSubmit, setLastSubmit] = useState(null);

  const defaultValues = useMemo(() => {
    const result = {};
    const assignDefaults = (field) => {
      if (field.type === "checkbox" && field.options?.length) {
        result[field.name] = [];
      } else if (field.type === "checkbox") {
        result[field.name] = false;
      } else {
        result[field.name] = "";
      }
      field.options?.forEach((option) =>
        option.nestedFields.forEach(assignDefaults)
      );
    };
    form.fields.forEach(assignDefaults);
    return result;
  }, [form.fields]);

  useEffect(() => {
    setValues(defaultValues);
    setErrors({});
    setLastSubmit(null);
  }, [defaultValues]);

  const validateField = (field, value) => {
    if (field.required) {
      if (field.type === "checkbox" && !field.options?.length) {
        if (value !== true) {
          return "This field must be checked";
        }
      } else if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return "This field is required";
      }
    }

    if (value === undefined || value === null || value === "") {
      return null;
    }

    if (field.type === "email") {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
      if (typeof value !== "string" || !emailRegex.test(value)) {
        return "Enter a valid email";
      }
    }

    if (field.type === "number") {
      const num = Number(value);
      if (Number.isNaN(num)) {
        return "Enter a number";
      }
      if (field.validation?.min !== undefined && num < field.validation.min) {
        return `Minimum value is ${field.validation.min}`;
      }
      if (field.validation?.max !== undefined && num > field.validation.max) {
        return `Maximum value is ${field.validation.max}`;
      }
    } else if (typeof value === "string") {
      if (field.validation?.min !== undefined && value.length < field.validation.min) {
        return `Minimum length is ${field.validation.min}`;
      }
      if (field.validation?.max !== undefined && value.length > field.validation.max) {
        return `Maximum length is ${field.validation.max}`;
      }
      if (field.validation?.regex) {
        try {
          const regex = new RegExp(field.validation.regex);
          if (!regex.test(value)) {
            return "Value does not match required pattern";
          }
        } catch {
          // ignore invalid regex on client; server enforces it
        }
      }
    }

    if (
      (field.type === "select" || field.type === "radio") &&
      field.options?.length
    ) {
      if (!field.options.some((option) => option.value === value)) {
        return "Select a valid option";
      }
    }

    if (field.type === "checkbox" && field.options?.length) {
      if (!Array.isArray(value)) {
        return "Select at least one option";
      }
      const validValues = new Set(field.options.map((option) => option.value));
      const hasInvalid = value.some((val) => !validValues.has(val));
      if (hasInvalid) {
        return "Select a valid option";
      }
    }

    return null;
  };

  const validateAll = () => {
    const nextErrors = {};
    const traverse = (field) => {
      const value = values[field.name];
      const error = validateField(field, value);
      if (error) {
        nextErrors[field.name] = error;
      }
      field.options?.forEach((option) => {
        const selectedRadioOrSelect =
          (field.type === "select" || field.type === "radio") &&
          value === option.value;
        const selectedCheckbox =
          field.type === "checkbox" &&
                Array.isArray(value) &&
                value.includes(option.value);

        if (selectedRadioOrSelect || selectedCheckbox) {
          option.nestedFields.forEach(traverse);
        }
      });
    };
    form.fields.forEach(traverse);
    setErrors(nextErrors);
    return nextErrors;
  };

  const handleChange = (fieldName, value) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length === 0) {
      await onSubmit(values);
      setLastSubmit(new Date().toISOString());
    }
  };

  const renderNested = (field, value) => {
    if (!field.options?.length) {
      return null;
    }

    const nestedFields = [];

    if (field.type === "radio" || field.type === "select") {
      const match = field.options.find((option) => option.value === value);
      if (match) {
        nestedFields.push(...match.nestedFields);
      }
    }

    if (field.type === "checkbox" && Array.isArray(value)) {
      field.options.forEach((option) => {
        if (value.includes(option.value)) {
          nestedFields.push(...option.nestedFields);
        }
      });
    }

    if (nestedFields.length === 0) {
      return null;
    }

    return (
      <div className="border-l-2 border-dashed border-slate-200 pl-4">
        <div className="space-y-4">
          {nestedFields.map((nested) => (
            <FieldControl
              key={nested.name}
              field={nested}
              value={values[nested.name]}
              error={errors[nested.name]}
              onChange={(val) => handleChange(nested.name, val)}
              renderNested={renderNested}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {form.fields.map((field) => (
          <FieldControl
            key={field.name}
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={(value) => handleChange(field.name, value)}
            renderNested={renderNested}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit response"}
        </Button>
        {lastSubmit && (
          <p className="text-sm text-slate-500">
            Last submitted at {new Date(lastSubmit).toLocaleTimeString()}
          </p>
        )}
      </div>
    </form>
  );
}

function FieldControl({ field, value, error, onChange, renderNested }) {
  const sharedLabel = (
    <Label htmlFor={field.name}>
      {field.label}
      {field.required && <span className="text-red-600">*</span>}
    </Label>
  );

  const description = field.description ? (
    <p className="text-sm text-slate-500">{field.description}</p>
  ) : null;

  const errorMessage = error ? (
    <p className="text-sm text-red-600">{error}</p>
  ) : null;

  let control = null;

  switch (field.type) {
    case "text":
    case "email":
    case "number":
    case "date":
      control = (
        <>
          {sharedLabel}
          <Input
            id={field.name}
            type={field.type === "text" ? "text" : field.type}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
          />
        </>
      );
      break;
    case "textarea":
      control = (
        <>
          {sharedLabel}
          <Textarea
            id={field.name}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            rows={4}
          />
        </>
      );
      break;
    case "select":
      control = (
        <>
          {sharedLabel}
          <select
            id={field.name}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      );
      break;
    case "radio":
      control = (
        <>
          {sharedLabel}
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(event) => onChange(event.target.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </>
      );
      break;
    case "checkbox":
      if (field.options?.length) {
        control = (
          <>
            {sharedLabel}
            <div className="space-y-2">
              {field.options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onChange={(event) => {
                      const current = Array.isArray(value) ? value : [];
                      if (event.target.checked) {
                        onChange([...current, option.value]);
                      } else {
                        onChange(current.filter((val) => val !== option.value));
                      }
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </>
        );
      } else {
        control = (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(event) => onChange(event.target.checked)}
            />
            {field.label}
          </label>
        );
      }
      break;
    default:
      control = null;
  }

  return (
    <div className={cn("space-y-2 rounded-xl border border-slate-200 bg-white p-4")}>
      {control}
      {description}
      {errorMessage}
      {renderNested(field, value)}
    </div>
  );
}

