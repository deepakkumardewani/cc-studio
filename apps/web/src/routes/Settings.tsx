import { useEffect, useState } from "react";
import { ReadOnlyField, type SchemaField } from "../components/field-renderers";
import { fetchSettings, fetchSettingsSchema } from "../lib/api";

export function Settings() {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchSettingsSchema(), fetchSettings()])
      .then(([schema, settingsResponse]) => {
        if (cancelled) {
          return;
        }
        setFields(schema.fields);
        setValues(settingsResponse.settings as Record<string, unknown>);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load settings.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-stone-600">Loading settings…</p>;
  }

  if (error) {
    return <p className="text-red-700">{error}</p>;
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Settings</p>
        <h2 className="text-2xl font-semibold tracking-tight">Claude Code settings.json</h2>
        <p className="mt-2 text-sm text-stone-600">
          Read-only view of every supported setting with its description and control type.
        </p>
      </div>

      <div className="grid gap-4">
        {fields.map((field) => (
          <ReadOnlyField key={field.key} field={field} value={values[field.key]} />
        ))}
      </div>
    </section>
  );
}
