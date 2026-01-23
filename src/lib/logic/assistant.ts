// AI Assistant Logic
// Rule-based assistant with optional LLM integration

export interface AssistantInput {
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AssistantResponse {
  content: string;
  intent: string;
}

// Intent classification by keywords
const INTENTS: Record<string, string[]> = {
    lowWater: ["low water", "little water", "no water", "drought", "dry", "save water"],
    containers: ["container", "pot", "bucket", "box", "balcony", "rooftop", "indoor"],
    startToday: ["start today", "begin", "get started", "first step", "how do i start"],
    pests: ["pest", "bug", "insect", "aphid", "caterpillar", "worm", "beetle", "flies"],
    saltySoil: ["salty", "salt", "saline", "sodium", "brackish"],
    watering: ["water", "irrigation", "how much water", "watering schedule", "when to water"],
    seedSaving: ["seed", "save seed", "store seed", "exchange seed"],
    soil: ["soil", "compost", "fertilizer", "nutrient", "dirt", "ground"],
    sunlight: ["sun", "shade", "light", "shadow", "dark"],
    harvest: ["harvest", "pick", "when ready", "ripe"],
    exchange: ["exchange", "share", "trade", "community", "marketplace"],
    general: [],
};

// Curated responses for each intent
const RESPONSES: Record<string, string> = {
    lowWater: `**Growing with limited water:**

1. Choose drought-tolerant crops: herbs, leafy greens, beans
2. Mulch heavily (5-10cm) to retain moisture
3. Water early morning only - reduces evaporation by 50%
4. Use greywater from washing (avoid soap residue)
5. Group plants by water needs
6. Consider drip irrigation from bottles

💡 Start with herbs - they need least water.`,

    containers: `**Container farming basics:**

1. Use containers 20-40cm deep with drainage holes
2. Fill with: 60% soil, 30% compost, 10% sand
3. Place in spot with 4+ hours sunlight
4. Water when top 2cm feels dry
5. Best starter crops: herbs, leafy greens, tomatoes

💡 Recycled buckets work great - just drill holes in bottom.`,

    startToday: `**Start growing today:**

1. Find 1 container with drainage (bucket, pot, box)
2. Fill with any available soil
3. Plant easy seeds: herbs, leafy greens, or beans
4. Place where sun reaches 4+ hours
5. Water gently until soil is moist
6. Check daily - water when top feels dry

💡 Don't overthink it. Start small, learn as you grow.`,

    pests: `**Safe pest management:**

1. Check plants daily - early detection is key
2. Remove affected leaves by hand immediately
3. Spray with soapy water (1 tsp soap per liter)
4. Plant basil/marigold nearby - natural deterrents
5. Encourage ladybugs - they eat aphids
6. Keep area clean of dead leaves

⚠️ Avoid chemical pesticides - harmful to you and soil.`,

    saltySoil: `**Managing salty soil:**

1. Test: white crust on soil = likely salty
2. Best fix: grow in containers with fresh soil
3. If using ground: flush with lots of water
4. Raise beds 20cm above ground level
5. Add organic matter (compost) - helps buffer salt
6. Choose tolerant crops: beets, spinach, herbs

💡 Container growing avoids salt problem entirely.`,

    watering: `**Smart watering guide:**

1. Morning watering is best (less evaporation)
2. Water soil, not leaves - prevents disease
3. Deep watering 2-3x weekly better than daily light watering
4. Check: stick finger 5cm in soil - water if dry
5. Seedlings need gentle, frequent watering
6. Mature plants need less frequent, deeper watering

💡 Consistent schedule matters more than quantity.`,

    seedSaving: `**Seed saving & exchange:**

1. Let some plants go to seed (don't harvest all)
2. Collect seeds when pods/fruits are fully dry
3. Store in paper envelope, cool dry place
4. Label with name and date
5. Most seeds last 2-3 years
6. Use Exchange feature to trade with community

💡 Start with beans, tomatoes, herbs - easiest to save.`,

    soil: `**Healthy soil basics:**

1. Good soil is dark, crumbly, and smells earthy
2. Add compost regularly - best soil improver
3. Never leave soil bare - mulch or plant cover crops
4. Avoid stepping on growing areas - compacts soil
5. Rotate crops each season for soil health
6. DIY compost: kitchen scraps + dry leaves

💡 Feed the soil, and the soil feeds your plants.`,

    sunlight: `**Managing sunlight:**

1. Full sun crops (6+ hrs): tomatoes, peppers, cucumber
2. Partial sun (4-6 hrs): leafy greens, herbs, beans
3. Shade tolerant (2-4 hrs): lettuce, spinach, mint
4. Track sun patterns across your space for one day
5. Use reflective surfaces to increase light
6. Create shade with cloth if too intense

💡 Morning sun is gentler than afternoon sun.`,

    harvest: `**When to harvest:**

1. Leafy greens: pick outer leaves when 10-15cm
2. Herbs: harvest before flowering for best flavor
3. Tomatoes: when fully colored and slightly soft
4. Beans: when pods are firm but before bulging
5. Potatoes: when leaves yellow and die back
6. Harvest in morning for best freshness

💡 Regular harvesting encourages more growth.`,

    exchange: `**Using the community exchange:**

1. List seeds, surplus produce, or tools you have
2. Browse what neighbors are offering
3. Claim items - provide your contact info
4. Arrange pickup at convenient public location
5. Start small - build trust in community
6. Share your growing knowledge too!

💡 Giving builds a stronger community for everyone.`,

    general: `**I'm here to help with:**

• Starting a small farm with limited resources
• Water-saving growing techniques
• Container and rooftop gardening
• Natural pest control
• Soil preparation and care
• Seed saving and exchange
• Harvest timing

What would you like to know more about?`,
};

// Preset prompts for UI
export const PRESET_PROMPTS = [
    { text: "What can I grow with low water?", intent: "lowWater" },
    { text: "How do I grow food in containers?", intent: "containers" },
    { text: "How do I start today?", intent: "startToday" },
    { text: "How do I reduce pests safely?", intent: "pests" },
    { text: "How do I know if soil is too salty?", intent: "saltySoil" },
];

function classifyIntent(message: string): string {
    const lowerMessage = message.toLowerCase();

    for (const [intent, keywords] of Object.entries(INTENTS)) {
        if (intent === "general") continue;
        for (const keyword of keywords) {
            if (lowerMessage.includes(keyword)) {
                return intent;
            }
        }
    }

    return "general";
}

// Rule-based response (used when no LLM available)
export function generateRuleBasedResponse(input: AssistantInput): AssistantResponse {
    const intent = classifyIntent(input.message);
    const content = RESPONSES[intent] || RESPONSES.general;

    return { content, intent };
}

// LLM-based response (when API key available)
export async function generateLLMResponse(
    input: AssistantInput,
    apiKey: string
): Promise<AssistantResponse> {
    const systemPrompt = `You are a farming assistant for low-resource environments and community food resilience.

RULES:
- Give concise, actionable steps (max 6 bullet points)
- Focus on practical, low-cost solutions
- Avoid long essays - be brief and helpful
- Never give medical advice
- Never recommend dangerous chemicals or pesticides
- Focus on: small-scale farming, container gardening, water conservation, natural pest control, seed saving, community exchange
- Always include at least one specific actionable suggestion
- If uncertain, suggest safe general practices
- Be encouraging and supportive`;

    const messages = [
        { role: "system", content: systemPrompt },
        ...(input.conversationHistory || []).slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
        })),
        { role: "user", content: input.message },
    ];

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages,
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error("LLM API failed");
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || RESPONSES.general;

        return { content, intent: "llm" };
    } catch {
    // Fallback to rule-based
        return generateRuleBasedResponse(input);
    }
}

// Main function - tries LLM first, falls back to rules
export async function getAssistantResponse(
    input: AssistantInput
): Promise<AssistantResponse> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
        return generateLLMResponse(input, apiKey);
    }

    return generateRuleBasedResponse(input);
}
