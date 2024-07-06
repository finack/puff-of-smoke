export function setLightMode() {
  localStorage.setItem("theme", "light");
  document.documentElement.classList.remove("dark");
}

export function setDarkMode() {
  localStorage.setItem("theme", "dark");
  document.documentElement.classList.add("dark");
}

export function toggleTheme() {
  if (document.documentElement.classList.contains("dark")) {
    setLightMode();
  } else {
    setDarkMode();
  }
  console.log(
    document.documentElement.classList.contains("dark")
      ? "Dark Mode"
      : "Light Mode",
  );
}

export function removeThemePreference() {
  localStorage.removeItem("theme");
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
