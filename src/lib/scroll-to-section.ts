function getHeaderOffset() {
  if (typeof window === "undefined") {
    return 0;
  }

  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--header-offset")
    .trim();
  const offset = Number.parseFloat(value);

  return Number.isFinite(offset) ? offset : 0;
}

export function scrollToSection(
  sectionId: string,
  behavior: ScrollBehavior = "smooth"
) {
  if (typeof window === "undefined") {
    return false;
  }

  const target = document.getElementById(sectionId);
  if (!target) {
    return false;
  }

  const nextTop =
    window.scrollY + target.getBoundingClientRect().top - getHeaderOffset();

  window.scrollTo({
    top: Math.max(0, nextTop),
    behavior,
  });

  return true;
}
