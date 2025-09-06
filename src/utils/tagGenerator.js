import placesData from "../data/vietnam_places.json";

// Hàm bỏ dấu tiếng Việt
function removeDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Stopwords (từ bỏ qua)
const stopwords = [
  "và",
  "của",
  "ở",
  "theo",
  "với",
  "là",
  "có",
  "trong",
  "khởi",
  "hành",
  "từ",
  "đến",
  "cùng",
  "tour",
  "du",
  "lịch",
  "dịch",
  "vụ",
  "ngày",
  "đêm",
];

// Regex số ngày/đêm
const durationRegex = /\d+\s*(ngày|đêm)/gi;

// Keywords đặc biệt
const keywordList = [
  "giá rẻ",
  "cao cấp",
  "trọn gói",
  "nghỉ dưỡng",
  "khám phá",
  "trải nghiệm",
  "team building",
  "ẩm thực",
  "văn hóa",
];

// Hàm sinh tags local
export function generateTagsLocal(title) {
  if (!title) return [];
  let raw = title.toLowerCase();
  let text = removeDiacritics(raw);
  let tags = [];

  // 1. Bắt số ngày/đêm
  const durations = text.match(durationRegex);
  if (durations) tags.push(...durations.map((d) => d.trim()));

  // 2. Match trong JSON
  Object.keys(placesData).forEach((category) => {
    placesData[category].forEach((place) => {
      if (text.includes(removeDiacritics(place.toLowerCase()))) {
        tags.push(place); // giữ nguyên có dấu
      }
    });
  });

  // 3. Match keywords
  keywordList.forEach((kw) => {
    if (text.includes(removeDiacritics(kw))) tags.push(kw);
  });

  // 4. Từ đơn quan trọng
  text.split(/\s+/).forEach((word) => {
    if (word.length > 2 && !stopwords.includes(word)) {
      tags.push(word.trim());
    }
  });

  // 5. Xóa trùng
  tags = [...new Set(tags)];

  return tags;
}
