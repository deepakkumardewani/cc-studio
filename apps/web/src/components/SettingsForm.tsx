import { zodResolver } from "@hookform/resolvers/zod";
import { SETTINGS_GROUP_ORDER, claudeSettingsSchema, type ClaudeSettings } from "schema";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useFormState, type FieldErrors } from "react-hook-form";
import { EditableField, type SchemaField } from "./field-renderers";
import { SCROLL_DURATION_MS, scrollElementIntoView, scrollToTop } from "../lib/scroll";

export type SettingsFormProps = {
  fields: SchemaField[];
  defaultValues: ClaudeSettings;
  onSubmit: (values: ClaudeSettings) => Promise<void> | void;
  submitError?: string | null;
  submitSuccess?: string | null;
  onDismissNotification?: () => void;
};

type SettingsSection = {
  id: string;
  label: string;
  fields: SchemaField[];
};

const SCROLL_TOP_THRESHOLD = 240;
const NOTIFICATION_DURATION_MS = 3200;

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

function filterSections(sections: SettingsSection[], query: string): SettingsSection[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return sections;
  }

  return sections
    .map((section) => ({
      ...section,
      fields: section.fields.filter(
        (field) =>
          field.label.toLowerCase().includes(normalizedQuery) ||
          field.key.toLowerCase().includes(normalizedQuery) ||
          field.description.toLowerCase().includes(normalizedQuery),
      ),
    }))
    .filter((section) => section.fields.length > 0);
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 text-text-muted"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ClearSearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m5 15 7-7 7 7" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function FormNotification({
  type,
  message,
  onDismiss,
}: {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  const isSuccess = type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
        isSuccess
          ? "border-success/30 bg-success/10 text-success"
          : "border-danger/30 bg-danger/10 text-danger"
      }`}
    >
      {isSuccess ? <CheckCircleIcon /> : <AlertCircleIcon />}
      <p className="min-w-0 flex-1 leading-snug">{message}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className={`shrink-0 rounded p-0.5 transition hover:bg-black/5 ${
          isSuccess ? "text-success" : "text-danger"
        }`}
      >
        <ClearSearchIcon />
      </button>
    </div>
  );
}

export function SettingsForm({
  fields,
  defaultValues,
  onSubmit,
  submitError,
  submitSuccess,
  onDismissNotification,
}: SettingsFormProps) {
  const sections = useMemo(() => groupFields(fields), [fields]);
  const [query, setQuery] = useState("");
  const filteredSections = useMemo(() => filterSections(sections, query), [sections, query]);
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isProgrammaticScroll = useRef(false);

  const { control, handleSubmit, reset } = useForm<ClaudeSettings>({
    resolver: zodResolver(claudeSettingsSchema),
    defaultValues,
  });
  const { errors, isSubmitting, isSubmitted, isDirty } = useFormState({ control });
  const validationErrorCount = countErrors(errors);
  const resultCount = filteredSections.reduce((total, section) => total + section.fields.length, 0);
  const isSearching = query.trim().length > 0;
  const canSave = isDirty && !isSubmitting;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!submitSuccess && !submitError) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onDismissNotification?.();
    }, NOTIFICATION_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [submitError, submitSuccess, onDismissNotification]);

  useEffect(() => {
    if (filteredSections.length === 0) {
      return;
    }

    if (!filteredSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(filteredSections[0]?.id ?? "");
    }
  }, [activeSectionId, filteredSections]);

  useEffect(() => {
    const container = contentScrollRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > SCROLL_TOP_THRESHOLD);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [filteredSections]);

  useEffect(() => {
    const container = contentScrollRef.current;
    if (
      !container ||
      filteredSections.length === 0 ||
      typeof IntersectionObserver === "undefined"
    ) {
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
        root: container,
        rootMargin: "-12% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const section of filteredSections) {
      const element = sectionRefs.current.get(section.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [filteredSections]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      searchInputRef.current?.focus();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function scrollToSection(section: SettingsSection) {
    const element = sectionRefs.current.get(section.id);
    const container = contentScrollRef.current;
    if (!element || !container) {
      return;
    }

    setActiveSectionId(section.id);
    isProgrammaticScroll.current = true;
    await scrollElementIntoView(element, 24, container);
    window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, SCROLL_DURATION_MS + 80);
  }

  async function handleScrollToTop() {
    const container = contentScrollRef.current;
    if (!container) {
      return;
    }

    isProgrammaticScroll.current = true;
    await scrollToTop(container);
    window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, SCROLL_DURATION_MS + 80);
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit((values) => onSubmit(values))}
      noValidate
    >
      <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="flex min-h-0 flex-col">
          <div className="shrink-0 pb-4">
            <label htmlFor="settings-search" className="sr-only">
              Search settings
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                id="settings-search"
                type="search"
                role="searchbox"
                value={query}
                placeholder="Search…"
                onChange={(event) => setQuery(event.target.value)}
                className="settings-search w-full rounded-lg border border-border-subtle bg-surface-raised py-2 pl-9 pr-9 text-sm text-text transition placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-0"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute inset-y-0 right-2 flex items-center rounded p-1 text-accent transition hover:bg-accent/10"
                >
                  <ClearSearchIcon />
                </button>
              ) : null}
            </div>
            {isSearching ? (
              <p className="mt-2 text-xs text-text-muted">
                {resultCount} result{resultCount === 1 ? "" : "s"}
              </p>
            ) : (
              <p className="mt-2 text-xs text-text-muted">Press / to search</p>
            )}
          </div>

          <ul className="flex min-h-0 flex-1 gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
            {filteredSections.map((section) => {
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
                    {isSearching ? (
                      <span className="ml-1 opacity-70">({section.fields.length})</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 shrink-0 space-y-3 border-t border-border-subtle bg-surface pt-4 lg:mt-6">
            {isSubmitted && validationErrorCount > 0 ? (
              <p className="text-sm text-danger" role="alert">
                Fix {validationErrorCount} validation error{validationErrorCount === 1 ? "" : "s"}{" "}
                before saving.
              </p>
            ) : null}

            {submitError ? (
              <FormNotification
                type="error"
                message={submitError}
                onDismiss={() => onDismissNotification?.()}
              />
            ) : null}
            {submitSuccess ? (
              <FormNotification
                type="success"
                message={submitSuccess}
                onDismiss={() => onDismissNotification?.()}
              />
            ) : null}

            <button
              type="submit"
              disabled={!canSave}
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? "Saving…" : "Save settings"}
            </button>
          </div>
        </nav>

        <div
          ref={contentScrollRef}
          className="relative min-h-0 overflow-y-auto overscroll-contain pr-1"
        >
          <div className="space-y-12 pb-8">
            {filteredSections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-subtle bg-surface-raised p-8 text-center">
                <p className="text-sm font-medium text-text">No settings match your search</p>
                <p className="mt-1 text-sm text-text-muted">
                  Try a different keyword or clear the search field.
                </p>
              </div>
            ) : (
              filteredSections.map((section) => (
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
                  className="scroll-mt-6 space-y-5"
                >
                  <h3
                    id={`${section.id}-heading`}
                    className="font-display text-xl font-semibold tracking-tight text-text"
                  >
                    {section.label}{" "}
                    <span className="font-sans text-base font-normal text-text-muted">
                      ({section.fields.length})
                    </span>
                  </h3>

                  <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-sm">
                    <div className="divide-y divide-border-subtle">
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
                              highlightQuery={isSearching ? query : undefined}
                            />
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              ))
            )}
          </div>

          {showScrollTop ? (
            <button
              type="button"
              aria-label="Scroll to top"
              onClick={() => handleScrollToTop()}
              className="sticky bottom-4 left-full ml-auto mr-0 inline-flex size-10 -translate-x-4 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-text shadow-md transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowUpIcon />
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
