import { Modal } from "./Modal";

type UnsavedChangesDialogProps = {
  onStay: () => void;
  onLeave: () => void;
  leaveLabel?: string;
};

export function UnsavedChangesDialog({
  onStay,
  onLeave,
  leaveLabel = "Discard and leave",
}: UnsavedChangesDialogProps) {
  return (
    <Modal title="Unsaved changes" onClose={onStay}>
      <div className="space-y-5 px-4 py-4">
        <p className="text-sm leading-relaxed text-text-muted">
          You have pending changes. Are you sure you want to continue? Your edits will be lost.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onStay}
            className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition hover:bg-surface-soft hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {leaveLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
