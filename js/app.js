"use strict";

const themeSelect = document.querySelector("#theme-select");
const themeStorageKey = "vizitka-theme";
const themes = new Set(["light", "dark", "bitrix", "accessible"]);

function applyTheme(theme) {
  const selectedTheme = themes.has(theme) ? theme : "light";
  document.documentElement.dataset.theme = selectedTheme;
  themeSelect.value = selectedTheme;
  localStorage.setItem(themeStorageKey, selectedTheme);
}

const savedTheme = localStorage.getItem(themeStorageKey) || "light";
applyTheme(savedTheme);

themeSelect.addEventListener("change", (event) => {
  applyTheme(event.target.value);
});

const lightbox = document.querySelector("#image-lightbox");
const lightboxImage = lightbox?.querySelector(".lightbox__image");
const lightboxCaption = lightbox?.querySelector(".lightbox__caption");
const lightboxViewport = lightbox?.querySelector(".lightbox__viewport");
const lightboxZoom = lightbox?.querySelector("#lightbox-zoom");
const lightboxZoomValue = lightbox?.querySelector("#lightbox-zoom-value");
const zoomableImages = document.querySelectorAll(".case-card__media img, .certificate-card img, .photo-grid img");
document.querySelectorAll("img").forEach((image) => { image.decoding = "async"; });
let lastFocusedImage = null;
let lightboxScale = 1;
let panX = 0;
let panY = 0;
let panState = null;

function renderLightboxScale() {
  if (!lightboxImage) return;
  lightboxImage.style.transform = `translate(${panX}px, ${panY}px) scale(${lightboxScale})`;
  lightboxViewport?.classList.toggle("is-zoomed", lightboxScale > 1);
  if (lightboxZoom) lightboxZoom.value = String(lightboxScale);
  if (lightboxZoomValue) lightboxZoomValue.value = `${Math.round(lightboxScale * 100)}%`;
}

function openLightbox(image) {
  if (!lightbox || !lightboxImage) return;
  lastFocusedImage = image;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.closest("figure")?.querySelector("figcaption")?.textContent || image.alt;
  lightboxScale = 1;
  panX = 0;
  panY = 0;
  renderLightboxScale();
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  lightbox.querySelector(".lightbox__close")?.focus();
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
  lightboxImage.style.transform = "";
  panX = 0;
  panY = 0;
  panState = null;
  lastFocusedImage?.focus();
}

zoomableImages.forEach((image) => {
  image.tabIndex = 0;
  image.setAttribute("role", "button");
  image.setAttribute("aria-label", `${image.alt}. Открыть увеличенное изображение`);
  image.addEventListener("click", () => openLightbox(image));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(image);
    }
  });
});

lightbox?.addEventListener("click", (event) => {
  if (event.target.closest("[data-lightbox-close]")) closeLightbox();
  const zoomButton = event.target.closest("[data-lightbox-zoom]");
  if (!zoomButton) return;
  lightboxScale = 1;
  renderLightboxScale();
});

lightboxZoom?.addEventListener("input", (event) => {
  lightboxScale = Number(event.target.value);
  if (lightboxScale === 1) { panX = 0; panY = 0; }
  renderLightboxScale();
});

lightboxViewport?.addEventListener("pointerdown", (event) => {
  if (lightboxScale <= 1) return;
  panState = { id: event.pointerId, x: event.clientX, y: event.clientY, panX, panY };
  lightboxViewport.setPointerCapture?.(event.pointerId);
  lightboxViewport.classList.add("is-panning");
  event.preventDefault();
});

lightboxViewport?.addEventListener("pointermove", (event) => {
  if (!panState || event.pointerId !== panState.id) return;
  const bounds = () => {
    const rect = lightboxImage.getBoundingClientRect();
    const viewportRect = lightboxViewport.getBoundingClientRect();
    return { x: Math.max(0, (rect.width - viewportRect.width) / 2), y: Math.max(0, (rect.height - viewportRect.height) / 2) };
  };
  const limit = bounds();
  panX = Math.max(-limit.x, Math.min(limit.x, panState.panX + event.clientX - panState.x));
  panY = Math.max(-limit.y, Math.min(limit.y, panState.panY + event.clientY - panState.y));
  renderLightboxScale();
});

function stopPanning(event) {
  if (!panState || (event.pointerId !== undefined && event.pointerId !== panState.id)) return;
  lightboxViewport?.releasePointerCapture?.(panState.id);
  lightboxViewport?.classList.remove("is-panning");
  panState = null;
}

lightboxViewport?.addEventListener("pointerup", stopPanning);
lightboxViewport?.addEventListener("pointercancel", stopPanning);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});
