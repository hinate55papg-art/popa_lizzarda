/* Rickovns site settings: add production URLs here when ready. */
const RICKOVNS_CONFIG = {
  downloadUrl: "", // Example: https://example.com/Rickovns-Launcher.exe
  forumUrl: "",    // Example: https://forum.example.com
};

const toast = document.querySelector(".toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

function connectLink(selector, key, message) {
  document.querySelectorAll(selector).forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const destination = RICKOVNS_CONFIG[key];
      if (destination) window.location.href = destination;
      else showToast(message);
    });
  });
}

connectLink("[data-download]", "downloadUrl", "Ссылка на клиент появится здесь перед запуском проекта.");
connectLink("[data-forum]", "forumUrl", "Форум Rickovns скоро откроется. Следи за новостями проекта.");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}));

/* Add data-animate="rise" to any element to reveal it on scroll. */
const animatedItems = document.querySelectorAll("[data-animate]");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  animatedItems.forEach((item, index) => {
    item.style.transitionDelay = `${(index % 5) * 75}ms`;
    observer.observe(item);
  });
} else {
  animatedItems.forEach((item) => item.classList.add("is-visible"));
}

const roleCards = document.querySelectorAll("[data-role]");
const selectedRoleTitle = document.querySelector(".selected-role-title");
const selectedRoleCopy = document.querySelector(".selected-role-copy");
roleCards.forEach((card) => {
  card.addEventListener("click", () => {
    roleCards.forEach((candidate) => {
      candidate.classList.remove("is-selected");
      candidate.setAttribute("aria-pressed", "false");
    });
    card.classList.add("is-selected");
    card.setAttribute("aria-pressed", "true");
    selectedRoleTitle.textContent = `ТВОЙ ПУТЬ: ${card.dataset.role.toUpperCase()}`;
    selectedRoleCopy.textContent = card.dataset.description;
  });
});

const progressBar = document.querySelector(".scroll-progress");
let progressFrame = 0;
function updateScrollProgress() {
  progressFrame = 0;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${progress})`;
}
window.addEventListener("scroll", () => {
  if (!progressFrame) progressFrame = window.requestAnimationFrame(updateScrollProgress);
}, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const gallery = document.querySelector(".path-gallery");
const panels = Array.from(gallery.querySelectorAll(".path-panel"));
function previewRole(panel) {
  panels.forEach(candidate => candidate.classList.toggle("is-open", candidate === panel));
}
panels.forEach((panel, index) => {
  panel.addEventListener("pointerenter", event => {
    if (event.pointerType === "mouse") previewRole(panel);
  });
  panel.addEventListener("focus", () => previewRole(panel));
  panel.addEventListener("click", () => previewRole(panel));
  panel.addEventListener("keydown", event => {
    const steps = {ArrowLeft:-1, ArrowUp:-1, ArrowRight:1, ArrowDown:1};
    if (!(event.key in steps)) return;
    event.preventDefault();
    panels[(index + steps[event.key] + panels.length) % panels.length].focus();
  });
});
const communityLinks = {
  telegram: "https://t.me/rickovnsrp/",
  discord: "https://discord.gg/Nr78y32j8",
  support: ""
};
for (const channel of document.querySelectorAll("[data-channel]")) {
  const url = communityLinks[channel.dataset.channel];
  if (url) {
    channel.href = url;
    channel.target = "_blank";
    channel.rel = "noopener noreferrer";
  } else {
    channel.setAttribute("aria-disabled", "true");
    const status = document.createElement("small");
    status.textContent = "Ссылка пока недоступна";
    channel.append(status);
  }
}
