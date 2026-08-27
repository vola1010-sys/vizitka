"use strict";

const themeSelect = document.querySelector("#theme-select");
const themeStorageKey = "vizitka-theme";
const themes = new Set(["light", "dark", "bitrix"]);

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
const zoomableImages = document.querySelectorAll(".case-card__media img, .certificate-card img, .photo-grid img");
let lastFocusedImage = null;

function openLightbox(image) {
  if (!lightbox || !lightboxImage) return;
  lastFocusedImage = image;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.closest("figure")?.querySelector("figcaption")?.textContent || image.alt;
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  lightbox.querySelector(".lightbox__close")?.focus();
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
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
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});
