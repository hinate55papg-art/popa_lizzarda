(() => {
  const key = "rickovns-demo-profile";
  const modal = document.querySelector("[data-main-account]");
  const form = document.querySelector("[data-main-account-form]");
  const trigger = document.querySelector("[data-open-main-account]");
  if (!modal || !form || !trigger) return;
  let profile = null;
  try { profile = JSON.parse(localStorage.getItem(key) || "null"); } catch { profile = null; }
  if (profile) {
    for (const [name, value] of Object.entries(profile)) if (form.elements[name]) form.elements[name].value = value;
    trigger.textContent = profile.nickname;
  }
  trigger.addEventListener("click", (event) => { event.preventDefault(); modal.hidden = false; });
  document.querySelector("[data-close-main-account]").addEventListener("click", () => { modal.hidden = true; });
  modal.addEventListener("click", (event) => { if (event.target === modal) modal.hidden = true; });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const next = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem(key, JSON.stringify(next));
    trigger.textContent = next.nickname;
    modal.hidden = true;
    const toast = document.querySelector(".toast");
    toast.textContent = "Профиль сохранён. Он появится в магазине на этом устройстве.";
    toast.classList.add("is-visible");
    setTimeout(() => toast.classList.remove("is-visible"), 3000);
  });
})();
