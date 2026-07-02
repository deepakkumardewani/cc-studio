import { zodResolver } from "@hookform/resolvers/zod";
import { claudeSettingsSchema, type ClaudeSettings } from "schema";
import { Controller, useForm, useFormState, type FieldErrors } from "react-hook-form";
import { EditableField, type SchemaField } from "./field-renderers";

export type SettingsFormProps = {
  fields: SchemaField[];
  defaultValues: ClaudeSettings;
  onSubmit: (values: ClaudeSettings) => Promise<void> | void;
  submitError?: string | null;
  submitSuccess?: string | null;
};

function fieldError(errors: FieldErrors<ClaudeSettings>, key: string): string | undefined {
  const error = errors[key as keyof ClaudeSettings];
  if (!error) {
    return undefined;
  }
  return typeof error.message === "string" ? error.message : String(error.message ?? "");
}

function countErrors(errors: FieldErrors<ClaudeSettings>): number {
  return Object.keys(errors).length;
}

export function SettingsForm({
  fields,
  defaultValues,
  onSubmit,
  submitError,
  submitSuccess,
}: SettingsFormProps) {
  const { control, handleSubmit } = useForm<ClaudeSettings>({
    resolver: zodResolver(claudeSettingsSchema),
    defaultValues,
  });
  const { errors, isSubmitting, isSubmitted } = useFormState({ control });
  const validationErrorCount = countErrors(errors);

  return (
    <form className="space-y-4" onSubmit={handleSubmit((values) => onSubmit(values))} noValidate>
      <div className="grid gap-4">
        {fields.map((field) => (
          <Controller
            key={field.key}
            name={field.key as keyof ClaudeSettings}
            control={control}
            render={({ field: controllerField }) => (
              <EditableField
                field={field}
                value={controllerField.value}
                onChange={controllerField.onChange}
                error={fieldError(errors, field.key)}
              />
            )}
          />
        ))}
      </div>

      {isSubmitted && validationErrorCount > 0 ? (
        <p className="text-sm text-red-700" role="alert">
          Fix {validationErrorCount} validation error{validationErrorCount === 1 ? "" : "s"} before
          saving.
        </p>
      ) : null}

      {submitError ? (
        <p className="text-sm text-red-700" role="alert">
          {submitError}
        </p>
      ) : null}
      {submitSuccess ? (
        <p className="text-sm text-emerald-700" role="status">
          {submitSuccess}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
