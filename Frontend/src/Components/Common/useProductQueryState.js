// hooks/useProductQueryState.js
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FILTER_DEFAULTS } from "../../Pages/FilterPanel"; // adjust path

const filtersFromParams = (params) => ({
  availability: params.get("availability") ? params.get("availability").split(",") : [],
  priceRange: params.get("priceRange") ? params.get("priceRange").split(",") : [],
  discount: params.get("discount") || null,
  colours: params.get("colours") ? params.get("colours").split(",") : [],
});

export function useProductQueryState({ fixedCategory, defaultSort = "newest", limit = 12 } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = fixedCategory || searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || defaultSort;
  const page = parseInt(searchParams.get("page") || "1", 10);

  // ── Applied filters: ALWAYS derived directly from the URL, same as sort/category/page.
  // No local state here → nothing to go stale after a remount or nav-back.
  const appliedFilters = filtersFromParams(searchParams);

  // ── Draft filters: what the (currently open) FilterPanel edits before "Apply".
  const [draftFilters, setDraftFilters] = useState(appliedFilters);

  // Keep the draft synced to whatever's actually applied — covers back/forward nav,
  // chip removal from outside the panel, and remounts.
  useEffect(() => {
    setDraftFilters(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateParam = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const writeFilters = useCallback((f, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    f.availability?.length ? next.set("availability", f.availability.join(",")) : next.delete("availability");
    f.priceRange?.length ? next.set("priceRange", f.priceRange.join(",")) : next.delete("priceRange");
    f.discount ? next.set("discount", f.discount) : next.delete("discount");
    f.colours?.length ? next.set("colours", f.colours.join(",")) : next.delete("colours");
    if (resetPage) next.set("page", "1");
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const setFilterKey = useCallback((key, val) => {
    setDraftFilters((prev) => ({ ...prev, [key]: val }));
  }, []);

  // Called when the FilterPanel opens — guarantees the draft always starts from
  // whatever is actually applied, even if the user opened/edited/closed-without-applying before.
  const resetDraftToApplied = useCallback(() => {
    setDraftFilters(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const applyFilters = useCallback(() => {
    writeFilters(draftFilters);
  }, [draftFilters, writeFilters]);

  const clearFilters = useCallback(() => {
    setDraftFilters(FILTER_DEFAULTS);
    writeFilters(FILTER_DEFAULTS);
  }, [writeFilters]);

  // Chip removal acts directly on the APPLIED filters (bypasses draft entirely),
  // so it persists to the URL immediately — matches sort/category behavior.
  const removeFilterValue = useCallback((key, value) => {
    const next = {
      ...appliedFilters,
      [key]: Array.isArray(appliedFilters[key])
        ? appliedFilters[key].filter((v) => v !== value)
        : null,
    };
    writeFilters(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, writeFilters]);

  const buildApiParams = useCallback(() => {
    const p = new URLSearchParams();
    if (category !== "All") p.set("category", category);
    p.set("sort", sort);
    p.set("page", page);
    p.set("limit", limit);

    if (appliedFilters.availability.length) p.set("availability", appliedFilters.availability.join(","));
    if (appliedFilters.priceRange.length) p.set("priceRange", appliedFilters.priceRange.join(","));
    if (appliedFilters.discount) p.set("discount", appliedFilters.discount);
    if (appliedFilters.colours.length) p.set("colours", appliedFilters.colours.join(","));

    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, page, limit, searchParams]);

  return {
    category, sort, page,
    filters: draftFilters,        // pass this to <FilterPanel filters={...} />
    appliedFilters,                // use this for chips + activeFilterCount
    setFilterKey,
    resetDraftToApplied,
    applyFilters, clearFilters, removeFilterValue,
    updateParam,
    buildApiParams,
  };
}