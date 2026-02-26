const fallbackImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
];

const imageByKeyword: Array<{ keywords: string[]; image: string }> = [
  {
    keywords: ["burger", "smash", "beef", "chicken burger"],
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80",
  },
  {
    keywords: ["fries", "potato"],
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1000&q=80",
  },
  {
    keywords: ["pasta", "gnocchi"],
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=80",
  },
  {
    keywords: ["salmon", "fish", "sea bass"],
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80",
  },
  {
    keywords: ["bowl", "veggie", "rice"],
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80",
  },
  {
    keywords: ["lemonade", "tea", "spritz", "fizz", "drink"],
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1000&q=80",
  },
  {
    keywords: ["cheesecake", "choco", "cookie", "tart", "dessert"],
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1000&q=80",
  },
];

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getMenuItemImage(itemName: string, categoryName?: string) {
  const normalized = `${itemName} ${categoryName ?? ""}`.toLowerCase();
  const matched = imageByKeyword.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );
  if (matched) return matched.image;
  const idx = hashString(normalized) % fallbackImages.length;
  return fallbackImages[idx];
}
