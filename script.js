(function () {
  const content = window.SITE_CONTENT;
  if (!content) {
    console.error("SITE_CONTENT is missing. Check that content.js loads before script.js.");
    return;
  }

  function getPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  }

  function setText(el, value) {
    if (value == null) return;
    el.textContent = value;
  }

  // Meta tags
  if (content.meta?.title) document.title = content.meta.title;
  const description = document.querySelector('meta[name="description"]');
  if (description && content.meta?.description) {
    description.setAttribute("content", content.meta.description);
  }

  // Simple text bindings
  document.querySelectorAll("[data-bind]").forEach((el) => {
    setText(el, getPath(content, el.getAttribute("data-bind")));
  });

  document.querySelectorAll("[data-bind-href]").forEach((el) => {
    const href = getPath(content, el.getAttribute("data-bind-href"));
    if (href != null) el.setAttribute("href", href);
  });

  document.querySelectorAll("[data-bind-mailto]").forEach((el) => {
    const email = getPath(content, el.getAttribute("data-bind-mailto"));
    if (email != null) el.setAttribute("href", `mailto:${email}`);
  });

  // List rendering from <template> elements
  document.querySelectorAll("[data-list]").forEach((container) => {
    const path = container.getAttribute("data-list");
    const templateId = container.getAttribute("data-template");
    const items = getPath(content, path);
    const template = document.getElementById(templateId);

    if (!Array.isArray(items) || !template) return;

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
      const clone = template.content.cloneNode(true);

      clone.querySelectorAll("[data-field]").forEach((fieldEl) => {
        const field = fieldEl.getAttribute("data-field");
        const value = field === "." ? item : item?.[field];
        setText(fieldEl, value);
      });

      fragment.appendChild(clone);
    });

    container.replaceChildren(fragment);
  });

  // FAQ accordion
  document.querySelectorAll(".faq-item").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.nextElementSibling;
      if (!answer) return;

      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      answer.hidden = expanded;
    });
  });
})();
