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
