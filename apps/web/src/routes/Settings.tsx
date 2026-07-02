import { useEffect, useState } from "react";
import type { ClaudeSettings } from "schema";
import { SettingsForm } from "../components/SettingsForm";
import type { SchemaField } from "../components/field-renderers";
import { fetchSettings, fetchSettingsSchema, updateSettings } from "../lib/api";

export function Settings() {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [values, setValues] = useState<ClaudeSettings>({});
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchSettingsSchema(), fetchSettings()])
      .then(([schema, settingsResponse]) => {
        if (cancelled) {
          return;
        }
        setFields(schema.fields);
        setValues(settingsResponse.settings as ClaudeSettings);
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

  async function handleSubmit(nextValues: ClaudeSettings) {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await updateSettings(nextValues);
      setValues(response.settings as ClaudeSettings);
      setSubmitSuccess("Settings saved.");
    } catch {
      setSubmitError("Unable to save settings. Check your values and try again.");
    }
  }

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
          Edit supported settings with schema validation. Only settings.json is writable.
        </p>
      </div>

      <SettingsForm
        fields={fields}
        defaultValues={values}
        onSubmit={handleSubmit}
        submitError={submitError}
        submitSuccess={submitSuccess}
      />
    </section>
  );
}
