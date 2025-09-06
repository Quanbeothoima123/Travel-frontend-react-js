export function removeDiacritics(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function slugify(str = "") {
  const cleaned = removeDiacritics(String(str))
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // chỉ giữ a-z0-9 và khoảng trắng/hyphen
    .trim()
    .replace(/\s+/g, "-") // biến khoảng trắng -> "-"
    .replace(/-+/g, "-"); // gộp nhiều "-" thành 1
  return cleaned;
}

export function generateSlugLocal(title = "") {
  const base = slugify(title || "");
  const suffix = Date.now(); // mls
  return base ? `${base}-${suffix}` : `${suffix}`;
}
