"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Select-all for the submissions table. The header checkbox ticks every row on this page; when the filter matches
 * more rows than the page shows, a bar offers to select all of them. "All matching" sends allMatching=1 and the
 * filter, and the server re-runs the filter to find the rows. Bulk actions on all matches ask for confirmation.
 */
export function SelectAllCheckbox() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const sync = () => {
      const boxes = [...form.querySelectorAll<HTMLInputElement>('input[name="ids"]')];
      const checked = boxes.filter((b) => b.checked).length;
      if (!ref.current) return;
      ref.current.checked = boxes.length > 0 && checked === boxes.length;
      ref.current.indeterminate = checked > 0 && checked < boxes.length;
      form.dispatchEvent(new CustomEvent("selection", { detail: { checked, total: boxes.length } }));
    };
    form.addEventListener("change", sync);
    return () => form.removeEventListener("change", sync);
  }, []);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label="Select all on this page"
      className="h-4 w-4 accent-cye-orange"
      onChange={(e) => {
        const form = e.currentTarget.form;
        form?.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((b) => (b.checked = e.currentTarget.checked));
        form?.dispatchEvent(new Event("change", { bubbles: true }));
      }}
    />
  );
}

export function SelectAllMatching({ matching, filters }: { matching: number; filters: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState({ checked: 0, total: 0 });
  const [all, setAll] = useState(false);
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const onSelection = (e: Event) => {
      const detail = (e as CustomEvent<{ checked: number; total: number }>).detail;
      setPage(detail);
      if (detail.checked < detail.total) setAll(false);
    };
    // Every bulk action on all matches asks first: it may change many rows on other pages.
    const onSubmit = (e: SubmitEvent) => {
      const input = form.querySelector<HTMLInputElement>('input[name="allMatching"]');
      if (input?.value === "1" && !window.confirm(`Apply this to all ${matching} submissions matching these filters?`)) e.preventDefault();
    };
    form.addEventListener("selection", onSelection);
    form.addEventListener("submit", onSubmit);
    return () => {
      form.removeEventListener("selection", onSelection);
      form.removeEventListener("submit", onSubmit);
    };
  }, [matching]);

  const pageFull = page.total > 0 && page.checked === page.total;
  return (
    <div ref={ref}>
      <input type="hidden" name="allMatching" value={all ? "1" : ""} />
      <input type="hidden" name="filters" value={filters} />
      {pageFull && matching > page.total ? (
        <p className="mb-3 rounded-xl bg-blue-50 px-4 py-2.5 text-center text-sm text-slate-700">
          {all ? (
            <>
              All <strong>{matching}</strong> submissions matching these filters are selected.{" "}
              <button type="button" onClick={() => setAll(false)} className="font-semibold text-cye-blue underline">
                Select only this page
              </button>
            </>
          ) : (
            <>
              All {page.total} on this page are selected.{" "}
              <button type="button" onClick={() => setAll(true)} className="font-semibold text-cye-blue underline">
                Select all {matching} submissions matching these filters
              </button>
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
