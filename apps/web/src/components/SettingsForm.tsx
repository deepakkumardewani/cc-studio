import { zodResolver } from "@hookform/resolvers/zod";
import { SETTINGS_GROUP_ORDER, claudeSettingsSchema, type ClaudeSettings } from "schema";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useFormState, type FieldErrors } from "react-hook-form";
import { EditableField, type SchemaField } from "./field-renderers";

export type SettingsFormProps = {
  fields: SchemaField[];
  defaultValues: ClaudeSettings;
  onSubmit: (values: ClaudeSettings) => Promise<void> | void;
  submitError?: string | null;
  submitSuccess?: string | null;
};

type SettingsSection = {
  id: string;
  label: string;
  fields: SchemaField[];
};

function sectionId(label: string): string {
  return `settings-section-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

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

function groupFields(fields: SchemaField[]): SettingsSection[] {
  const fieldsByGroup = new Map<string, SchemaField[]>();

  for (const field of fields) {
    const groupFieldsForKey = fieldsByGroup.get(field.group) ?? [];
    groupFieldsForKey.push(field);
    fieldsByGroup.set(field.group, groupFieldsForKey);
  }

  return SETTINGS_GROUP_ORDER.flatMap((group) => {
    const groupFieldsList = fieldsByGroup.get(group);
    if (!groupFieldsList?.length) {
      return [];
    }

    return [
      {
        id: sectionId(group),
        label: group,
        fields: groupFieldsList,
      },
    ];
  });
}

export function SettingsForm({
  fields,
  defaultValues,
  onSubmit,
  submitError,
  submitSuccess,
}: SettingsFormProps) {
  const sections = useMemo(() => groupFields(fields), [fields]);
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const isProgrammaticScroll = useRef(false);

  const { control, handleSubmit } = useForm<ClaudeSettings>({
    resolver: zodResolver(claudeSettingsSchema),
    defaultValues,
  });
  const { errors, isSubmitting, isSubmitted } = useFormState({ control });
  const validationErrorCount = countErrors(errors);

  useEffect(() => {
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) {
          return;
        }

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        const nextId = visible[0]?.target.id;
        if (nextId) {
          setActiveSectionId(nextId);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const section of sections) {
      const element = sectionRefs.current.get(section.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [sections]);

  function scrollToSection(section: SettingsSection) {
    const element = sectionRefs.current.get(section.id);
    if (!element) {
      return;
    }

    setActiveSectionId(section.id);
    isProgrammaticScroll.current = true;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit((values) => onSubmit(values))} noValidate>
      <div className="grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="lg:sticky lg:top-6 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {sections.map((section) => {
              const isActive = activeSectionId === section.id;

              return (
                <li key={section.id} className="shrink-0">
                  <button
                    type="button"
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => scrollToSection(section)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "bg-accent text-accent-fg"
                        : "text-text-muted hover:bg-surface-raised hover:text-text"
                    }`}
                  >
                    {section.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-10">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              ref={(element) => {
                if (element) {
                  sectionRefs.current.set(section.id, element);
                } else {
                  sectionRefs.current.delete(section.id);
                }
              }}
              aria-labelledby={`${section.id}-heading`}
              className="scroll-mt-6 space-y-4"
            >
              <div>
                <h3
                  id={`${section.id}-heading`}
                  className="text-lg font-semibold tracking-tight text-text"
                >
                  {section.label}
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  {section.fields.length} setting{section.fields.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="grid gap-4">
                {section.fields.map((field) => (
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
            </section>
          ))}
        </div>
      </div>

      {isSubmitted && validationErrorCount > 0 ? (
        <p className="text-sm text-danger" role="alert">
          Fix {validationErrorCount} validation error{validationErrorCount === 1 ? "" : "s"} before
          saving.
        </p>
      ) : null}

      {submitError ? (
        <p className="text-sm text-danger" role="alert">
          {submitError}
        </p>
      ) : null}
      {submitSuccess ? (
        <p className="text-sm text-success" role="status">
          {submitSuccess}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
