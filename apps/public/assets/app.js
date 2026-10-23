// Progressive enhancement only: every page works without this file.
(() => {
  // Menu filters: apply on change instead of waiting for the submit button.
  const form = document.querySelector("[data-filters]");
  if (form) {
    const submit = form.querySelector("[data-filter-submit]");
    if (submit) submit.hidden = true;
    form.addEventListener("change", () => {
      const data = new FormData(form);
      const url = new URL(form.action, location.href);
      for (const key of ["diet", "avoid"]) {
        const values = data.getAll(key);
        if (values.length) url.searchParams.set(key, values.join(","));
      }
      const keepOpen = form.querySelector("details")?.open;
      location.assign(url.pathname + url.search + (keepOpen ? "" : ""));
    });
  }
})();
