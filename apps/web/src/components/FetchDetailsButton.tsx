type Props = {
  onClick: () => void;
};

export function FetchDetailsButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-soft hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Fetch Context Details
    </button>
  );
}
