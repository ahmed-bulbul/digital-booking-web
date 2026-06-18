"use client";

type PaginationProps = {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange
}: PaginationProps) {
  const displayTotal = totalPages > 0 ? totalPages : 1;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-on-surface-variant">Page {page + 1} of {displayTotal}</p>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-outline-variant/50 px-4 py-2 font-semibold text-on-surface disabled:opacity-50"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={!hasPrevious}
        >
          Prev
        </button>
        <button
          className="rounded-lg border border-outline-variant/50 px-4 py-2 font-semibold text-on-surface disabled:opacity-50"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
