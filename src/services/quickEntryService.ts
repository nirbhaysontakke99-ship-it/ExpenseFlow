import { toPaise } from '@/core/utils/currencyUtils';

export interface ParsedTransaction {
  amountPaise: number;
  categoryId: string;
  note: string;
  confidence: 'high' | 'medium' | 'low';
}

const KEYWORD_CATEGORY_MAP: Record<string, string[]> = {
  food: [
    'dinner', 'lunch', 'breakfast', 'food', 'restaurant', 'pizza', 'coffee', 'tea',
    'snack', 'cafe', 'burger', 'biryani', 'zomato', 'swiggy', 'eating', 'dosa', 'chai'
  ],
  transport: [
    'auto', 'bus', 'uber', 'ola', 'metro', 'train', 'taxi', 'fuel', 'petrol',
    'cab', 'rapido', 'rickshaw', 'diesel', 'toll', 'fare'
  ],
  groceries: [
    'grocery', 'groceries', 'vegetables', 'milk', 'supermarket', 'zepto', 'blinkit',
    'instamart', 'fruits', 'sabzi', 'kirana', 'egg', 'bread'
  ],
  rent: ['rent', 'hostel', 'pg', 'room', 'maintenance', 'flat'],
  bills: ['bill', 'electricity', 'wifi', 'water', 'gas', 'power', 'light', 'current'],
  recharge: ['recharge', 'mobile', 'jio', 'airtel', 'vi', 'phone', 'data', 'sim'],
  education: ['college', 'book', 'course', 'exam', 'tuition', 'stationer', 'fee', 'xerox', 'notes', 'pen'],
  shopping: ['shopping', 'clothes', 'shoes', 'amazon', 'flipkart', 'myntra', 'dress', 'shirt', 'pants', 'tshirt'],
  entertainment: ['movie', 'game', 'netflix', 'concert', 'cinema', 'prime', 'spotify', 'outing', 'show', 'theater'],
  health: ['doctor', 'medicine', 'pharmacy', 'hospital', 'lab', 'health', 'clinic', 'tablet', 'medical', 'syrup'],
  travel: ['flight', 'hotel', 'trip', 'vacation', 'travel', 'irctc', 'booking', 'tour'],
};

/**
 * Deterministic Quick Entry Parser
 * Example input: "₹250 dinner" or "120 auto to college"
 */
export function parseQuickEntry(input: string): ParsedTransaction | null {
  if (!input || !input.trim()) return null;

  const text = input.trim();

  // Regex to extract monetary amount (e.g. ₹250, 250.50, 1,250)
  const amountRegex = /(?:₹\s*)?(\d+(?:,\d+)*(?:\.\d{1,2})?)/i;
  const match = text.match(amountRegex);

  if (!match) return null;

  const rawAmountStr = match[1].replace(/,/g, '');
  const numericAmount = parseFloat(rawAmountStr);

  if (isNaN(numericAmount) || numericAmount <= 0) return null;

  const amountPaise = toPaise(numericAmount);

  // Extract description/note text by stripping the matched amount & currency symbol
  let noteText = text.replace(match[0], '').trim();
  noteText = noteText.replace(/^₹\s*/, '').trim();

  // Match category by keyword
  const lowerText = text.toLowerCase();
  let matchedCategory = 'other_exp';
  let confidence: 'high' | 'medium' | 'low' = 'low';

  for (const [catId, keywords] of Object.entries(KEYWORD_CATEGORY_MAP)) {
    for (const kw of keywords) {
      if (lowerText.includes(kw)) {
        matchedCategory = catId;
        confidence = 'high';
        break;
      }
    }
    if (confidence === 'high') break;
  }

  // If no note extracted, use category name or original text
  const finalNote = noteText || (matchedCategory !== 'other_exp' ? text : 'Quick Entry');

  return {
    amountPaise,
    categoryId: matchedCategory,
    note: finalNote,
    confidence,
  };
}
