/**
 * Mock AI service.
 *
 * Designed as a drop-in interface so a real provider (Claude, OpenAI, etc.)
 * can replace the implementation without changing call sites.
 *
 * Exposed surface:
 *   aiService.respond(userMessage, history) => { content, metadata }
 */

export interface AiHistoryItem {
  role: "USER" | "ASSISTANT";
  content: string;
}

export interface AiResponse {
  content: string;
  metadata?: Record<string, unknown>;
}

interface Pattern {
  match: RegExp;
  build: (input: string) => AiResponse;
}

const itineraryFor = (city: string): AiResponse => ({
  content: `Of course, happy to help you discover ${city} just as you like it.

🏯 DAY 1 (Traditional & Classic ${city})
- Wander the old town and visit the most iconic landmarks
- Stop for a local lunch in a beloved neighborhood spot

⛩ DAY 2 (Modern ${city})
- Explore the contemporary art / design district
- Sunset viewpoint, then dinner at a buzzy local restaurant

🛍 DAY 3 (Luxury ${city})
- Slow morning at a spa or signature café
- Boutique shopping followed by a special tasting-menu dinner

Most of these are free or low-cost — would you like me to book the paid attractions?`,
  metadata: {
    suggestions: [`Yes, book the highlights`, `No, I want to explore more`],
    intent: "ITINERARY",
    city,
  },
});

const flightDealsFor = (route: string): AiResponse => ({
  content: `Here are 3 great fares for ${route} I'm seeing right now:

✈️ Singapore Airlines — direct, $920 economy
✈️ Emirates — 1 stop, $815 economy (best value)
✈️ Qatar Airways — 1 stop, $1,140 business-light

Want me to hold a seat on the Emirates option?`,
  metadata: {
    suggestions: [`Hold the Emirates fare`, `Show me business class`],
    intent: "FLIGHT_DEALS",
  },
});

const hotelSuggest = (city: string): AiResponse => ({
  content: `Top-rated stays in ${city} that match your style:

🏨 The Boutique House — $180/night, 9.2/10
🏨 Garden Suites — $240/night, 9.4/10
🏨 Skyline Residences — $390/night, 9.6/10

Would you like to compare amenities side-by-side?`,
  metadata: {
    suggestions: [`Compare them`, `Book Garden Suites`],
    intent: "HOTEL_SUGGEST",
  },
});

const PATTERNS: Pattern[] = [
  {
    match: /itinerary|plan(?:ning)? (?:a |my )?(?:trip|visit)|things to do/i,
    build: (input) => {
      const city =
        input.match(/(?:in|for|to)\s+([A-Z][\w\s]+?)(?:\?|\.|,|based|$)/i)?.[1]?.trim() ??
        "your destination";
      return itineraryFor(city);
    },
  },
  {
    match: /flight|fly|fare|ticket/i,
    build: (input) => {
      const route =
        input.match(/from\s+([\w\s]+?)\s+to\s+([\w\s]+?)(?:\?|\.|,|$)/i)?.slice(1, 3).join(" → ") ??
        "your route";
      return flightDealsFor(route);
    },
  },
  {
    match: /hotel|stay|accommodation|where to sleep/i,
    build: (input) => {
      const city = input.match(/in\s+([A-Z][\w\s]+?)(?:\?|\.|,|$)/i)?.[1]?.trim() ?? "your city";
      return hotelSuggest(city);
    },
  },
  {
    match: /budget|spend|cost/i,
    build: () => ({
      content:
        "Based on your past trips, you typically spend ~$220/day on city breaks and ~$310/day on island/luxury trips. Want me to draft a daily budget for your next destination?",
      metadata: { suggestions: ["Draft a budget", "Compare with last trip"], intent: "BUDGET" },
    }),
  },
  {
    match: /hello|hi|hey|good (morning|afternoon|evening)/i,
    build: () => ({
      content:
        "Hi! I'm P-IONNA, your personal travel assistant. Ask me to plan an itinerary, find flight deals, suggest hotels, or summarize a booking — just say the word.",
      metadata: {
        suggestions: ["Plan a 3-day trip to Tokyo", "Find me flight deals", "Suggest hotels in Lisbon"],
      },
    }),
  },
];

const fallback = (input: string): AiResponse => ({
  content:
    `I love that idea — let's shape it together. Could you tell me a bit more about *${input.trim().slice(0, 60)}*? ` +
    `For example: dates, who's travelling, and your rough budget. The more I know, the better I can tailor it.`,
  metadata: { intent: "CLARIFY" },
});

export const aiService = {
  async respond(userMessage: string, _history: AiHistoryItem[] = []): Promise<AiResponse> {
    // Simulate processing delay so the UI typing indicator feels real.
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
    for (const pattern of PATTERNS) {
      if (pattern.match.test(userMessage)) {
        return pattern.build(userMessage);
      }
    }
    return fallback(userMessage);
  },
};
