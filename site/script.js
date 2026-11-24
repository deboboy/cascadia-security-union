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

  // Meta tags (static OG tags also live in index.html for crawlers that skip JS)
  function setMeta(selector, attr, value) {
    if (value == null) return;
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  if (content.meta?.title) document.title = content.meta.title;
  setMeta('meta[name="description"]', "content", content.meta?.description);
  setMeta('meta[property="og:title"]', "content", content.meta?.title);
  setMeta('meta[property="og:description"]', "content", content.meta?.description);
  setMeta('meta[property="og:url"]', "content", content.meta?.url);
  setMeta('meta[property="og:image"]', "content", content.meta?.image);
  setMeta('meta[property="og:image:alt"]', "content", content.meta?.imageAlt);
  setMeta('meta[name="twitter:title"]', "content", content.meta?.title);
  setMeta('meta[name="twitter:description"]', "content", content.meta?.description);
  setMeta('meta[name="twitter:image"]', "content", content.meta?.image);
  setMeta('link[rel="canonical"]', "href", content.meta?.url);

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

  // Founding invite form → /api/invite → Discord
  const inviteForm = document.getElementById("invite-form");
  const inviteStatus = document.getElementById("invite-status");
  const inviteCopy = content.invite || {};
  const challengeLabel = document.getElementById("invite-challenge-label");
  const formTokenInput = document.getElementById("invite-form-token");
  const challengeTokenInput = document.getElementById("invite-challenge-token");
  const challengeBaseLabel = inviteCopy.fields?.challenge || "Quick check (helps reduce spam)";

  function showInviteStatus(message, kind) {
    if (!inviteStatus) return;
    inviteStatus.hidden = false;
    inviteStatus.textContent = message;
    inviteStatus.classList.remove("is-success", "is-error");
    if (kind) inviteStatus.classList.add(kind);
  }

  async function loadInviteSession() {
    if (!inviteForm || !formTokenInput || !challengeTokenInput) return false;

    try {
      const response = await fetch("/api/invite", { method: "GET", cache: "no-store" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.formToken || !data.challengeToken) {
        throw new Error(data.error || inviteCopy.sessionErrorMessage || "Session failed.");
      }

      formTokenInput.value = data.formToken;
      challengeTokenInput.value = data.challengeToken;
      if (challengeLabel) {
        challengeLabel.textContent = data.challengeQuestion
          ? `${challengeBaseLabel}: ${data.challengeQuestion}`
          : challengeBaseLabel;
      }
      return true;
    } catch (err) {
      formTokenInput.value = "";
      challengeTokenInput.value = "";
      showInviteStatus(
        err.message || inviteCopy.sessionErrorMessage || "Could not prepare the form.",
        "is-error"
      );
      return false;
    }
  }

  if (inviteForm) {
    loadInviteSession();

    inviteForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitButton = inviteForm.querySelector('button[type="submit"]');
      const formData = new FormData(inviteForm);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        organization: String(formData.get("organization") || "").trim(),
        role: String(formData.get("role") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
        company: String(formData.get("company") || "").trim(),
        challenge_answer: String(formData.get("challenge_answer") || "").trim(),
        form_token: String(formData.get("form_token") || "").trim(),
        challenge_token: String(formData.get("challenge_token") || "").trim(),
      };

      if (!payload.name || !payload.email || !payload.organization || !payload.role) {
        showInviteStatus("Please fill in name, email, organization, and role.", "is-error");
        return;
      }

      if (!payload.challenge_answer || !payload.form_token || !payload.challenge_token) {
        showInviteStatus("Please complete the quick check, then try again.", "is-error");
        await loadInviteSession();
        return;
      }

      if (submitButton) submitButton.disabled = true;
      showInviteStatus("Sending your request…");

      try {
        const response = await fetch("/api/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.error || inviteCopy.errorMessage || "Request failed.");
        }

        inviteForm.reset();
        showInviteStatus(
          inviteCopy.successMessage || "Thanks — your request was received.",
          "is-success"
        );
        await loadInviteSession();
      } catch (err) {
        showInviteStatus(
          err.message || inviteCopy.errorMessage || "Something went wrong.",
          "is-error"
        );
        await loadInviteSession();
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }
})();
