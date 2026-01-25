/**
 * Database Seed Script for Lifelines
 * Generates realistic fake data for Gaza, Palestine
 *
 * Run with: npx tsx scripts/seed.ts
 */

import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

// ============================================================================
// GAZA-SPECIFIC DATA
// ============================================================================

// Gaza Strip coordinates: approximately 31.5° N, 34.47° E
// Bounds: lat 31.22 - 31.60, lng 34.20 - 34.56
const GAZA_LOCATIONS = [
    { name: "Gaza City", lat: 31.5017, lng: 34.4668, weight: 30 },
    { name: "Khan Yunis", lat: 31.3462, lng: 34.3061, weight: 18 },
    { name: "Rafah", lat: 31.2969, lng: 34.2451, weight: 15 },
    { name: "Jabalia", lat: 31.5283, lng: 34.4831, weight: 12 },
    { name: "Deir al-Balah", lat: 31.4167, lng: 34.3500, weight: 10 },
    { name: "Beit Lahia", lat: 31.5500, lng: 34.5000, weight: 8 },
    { name: "Beit Hanoun", lat: 31.5333, lng: 34.5333, weight: 7 },
];

// Palestinian Arabic names
const MALE_FIRST_NAMES = [
    "Ahmed", "Mohammed", "Mahmoud", "Ibrahim", "Youssef", "Omar", "Ali",
    "Hassan", "Hussein", "Khaled", "Tariq", "Nabil", "Fadi", "Sami",
    "Jamal", "Karim", "Bilal", "Mustafa", "Rami", "Walid", "Samir",
    "Ayman", "Ziad", "Faisal", "Hani", "Mazen", "Bassem", "Nasser",
    "Adnan", "Salah", "Rafiq", "Jihad", "Imad", "Munir", "Wael",
];

const FEMALE_FIRST_NAMES = [
    "Fatima", "Mariam", "Aisha", "Hana", "Layla", "Nour", "Sara",
    "Yasmin", "Reem", "Dina", "Lina", "Amira", "Salma", "Rana",
    "Huda", "Maha", "Sawsan", "Nisreen", "Suha", "Dalal", "Wafa",
    "Abeer", "Nadia", "Rania", "Sahar", "Lamia", "Ghada", "Maysoon",
    "Iman", "Sana", "Khawla", "Samira", "Lubna", "Ruba", "Maysa",
];

const FAMILY_NAMES = [
    "Abu Salah", "Al-Masri", "Al-Najjar", "Baraka", "Darwish", "El-Farra",
    "Ghazi", "Hamad", "Jabr", "Khalil", "Mansour", "Nasser", "Qassem",
    "Saleh", "Shurrab", "Abed", "Awad", "Hammad", "Khatib", "Madhoun",
    "Nassar", "Radwan", "Shehab", "Ziada", "Abu Amra", "Abu Shanab",
    "Al-Qudra", "Barbakh", "Doghmosh", "El-Haddad", "Hilles", "Sarsour",
    "Abu Taha", "Al-Ashi", "Habib", "Kanaan", "Mushtaha", "Shaheen",
];

// Plants that grow well in Gaza's Mediterranean climate
const GAZA_SUITABLE_PLANTS = [
    // High priority - traditional Palestinian crops
    { id: "tomato", name: "Tomato", weight: 20 },
    { id: "cucumber", name: "Cucumber", weight: 18 },
    { id: "pepper", name: "Bell Pepper", weight: 15 },
    { id: "eggplant", name: "Eggplant", weight: 14 },
    { id: "zucchini", name: "Zucchini", weight: 12 },
    // Leafy greens
    { id: "lettuce", name: "Lettuce", weight: 10 },
    { id: "spinach", name: "Spinach", weight: 10 },
    { id: "arugula", name: "Arugula", weight: 8 },
    // Herbs - very common in Palestinian cuisine
    { id: "mint", name: "Mint", weight: 15 },
    { id: "parsley", name: "Parsley", weight: 15 },
    { id: "basil", name: "Basil", weight: 10 },
    { id: "cilantro", name: "Cilantro", weight: 8 },
    { id: "thyme", name: "Thyme", weight: 8 },
    // Legumes - staple crops
    { id: "beans", name: "Beans", weight: 12 },
    { id: "peas", name: "Peas", weight: 10 },
    { id: "lentils", name: "Lentils", weight: 8 },
    { id: "chickpeas", name: "Chickpeas", weight: 10 },
    // Root vegetables
    { id: "onion", name: "Onion", weight: 14 },
    { id: "garlic", name: "Garlic", weight: 12 },
    { id: "carrot", name: "Carrot", weight: 10 },
    { id: "radish", name: "Radish", weight: 8 },
    { id: "potato", name: "Potato", weight: 10 },
    // Fruits
    { id: "strawberry", name: "Strawberry", weight: 8 },
    { id: "watermelon", name: "Watermelon", weight: 6 },
    { id: "grapes", name: "Grapes", weight: 5 },
];

// Farm name patterns in Arabic style
const FARM_NAME_PATTERNS = [
    "مزرعة {family}", // Mazra'at (Farm of) Family
    "{family} Garden",
    "Al-{family} Farm",
    "Janna {family}", // Paradise of Family
    "Bustan {family}", // Orchard of Family
    "{family} Rooftop",
    "{family} Green Corner",
    "Hope Garden",
    "Resilience Farm",
    "Al-Ard Garden", // The Land
    "Al-Kheir Farm", // The Good
    "Samoud Garden", // Steadfastness
];

const FARM_EMOJIS = ["🌱", "🌿", "🥬", "🍅", "🥒", "🌻", "🌾", "🏡", "☘️", "🌳", "🍃", "🥕"];

const COMPOST_SITE_NAMES = [
    "Gaza Green Compost",
    "Al-Balad Recycling Center",
    "Community Compost Hub",
    "Khan Yunis Composting",
    "Rafah Green Initiative",
    "Urban Farmers Collective",
    "Beit Lahia Compost Site",
    "Jabalia Community Garden",
    "Al-Ard Sustainability Center",
    "Palestine Green Project",
    "Gaza Urban Agriculture Hub",
    "Deir al-Balah Composting",
    "Al-Hayat Green Center",
    "Sumoud Composting Facility",
];

const COMPOST_EMOJIS = ["♻️", "🌱", "🌿", "🍂", "🌍", "💚"];

// Claim messages for exchange
const CLAIM_MESSAGES = [
    "Salam! I would love to get this. When can I pick up?",
    "Hello, I'm very interested! Is this still available?",
    "Jazak Allah khair for sharing. I can come today.",
    "Marhaba! I need this for my garden. Available now?",
    "Shukran! Can we arrange pickup tomorrow?",
    "Is this still available? I live nearby in {location}.",
    "Peace be upon you. I would like to claim this please.",
    "Hello, my family could really use this. Thank you!",
    "Interested! I can trade some fresh tomatoes.",
    "Salam, can I pick this up this afternoon?",
    "Beautiful! I've been looking for exactly this.",
    "May Allah bless you. When is a good time?",
];

// Trade offers for trade-type claims
const TRADE_OFFERS = [
    "Fresh tomatoes from my garden",
    "Homemade compost (5kg)",
    "Mint and parsley bundle",
    "Cucumber seeds - heirloom variety",
    "Fresh eggs (6 pieces)",
    "Homegrown onions",
    "Hand trowel set",
    "Watering can",
    "Dried za'atar herbs",
    "Fresh lettuce heads",
];

// Water tips
const WATER_TIPS = [
    "Water early morning to reduce evaporation in Gaza's heat",
    "Use drip irrigation to conserve water",
    "Mulch around plants to retain moisture",
    "Collect greywater for garden use",
    "Group plants with similar water needs together",
    "Check soil moisture before watering",
    "Consider shade cloth during peak summer",
    "Rainwater harvesting is excellent for gardens",
];

// Plan setup checklist items
const SETUP_CHECKLIST_ITEMS = [
    "Prepare containers or growing area",
    "Test soil pH and salinity",
    "Set up irrigation system",
    "Acquire seeds from exchange or nursery",
    "Prepare compost or organic fertilizer",
    "Install shade cloth if needed",
    "Create planting schedule",
    "Connect with local farming community",
    "Plan water collection system",
    "Prepare seedling trays",
];

// Image URLs for listings (from Unsplash - free to use)
const LISTING_IMAGES = {
    seeds: [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop", // seeds in hand
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&h=300&fit=crop", // seed packets
        "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=400&h=300&fit=crop", // seeds close up
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop", // seeds variety
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", // planting seeds
        "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=300&fit=crop", // seedlings
    ],
    produce: [
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop", // tomatoes
        "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=300&fit=crop", // cucumbers
        "https://images.unsplash.com/photo-1518977676601-b53f82ber33b?w=400&h=300&fit=crop", // vegetables
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop", // lettuce
        "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&h=300&fit=crop", // peppers
        "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop", // herbs
        "https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?w=400&h=300&fit=crop", // fresh vegetables
        "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop", // eggplant
        "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=400&h=300&fit=crop", // onions
        "https://images.unsplash.com/photo-1508747703725-719f0c575f86?w=400&h=300&fit=crop", // garlic
    ],
    tools: [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop", // garden tools
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop", // gardening
        "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400&h=300&fit=crop", // watering can
        "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400&h=300&fit=crop", // tools set
        "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&h=300&fit=crop", // garden work
    ],
    fertilizer: [
        "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400&h=300&fit=crop", // compost
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", // organic matter
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop", // soil
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop", // fertilizer
    ],
    other: [
        "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=300&fit=crop", // garden
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop", // plants
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop", // gardening
    ],
};

// Exchange listing realistic titles
const EXCHANGE_TITLES = {
    seeds: [
        "Heirloom tomato seeds",
        "Local cucumber seeds",
        "Palestinian eggplant seeds",
        "Mint cuttings",
        "Parsley seeds - organic",
        "Bell pepper seeds",
        "Zucchini seeds",
        "Lettuce variety mix",
        "Thyme seeds",
        "Chickpea seeds",
        "Watermelon seeds",
        "Onion seeds - local variety",
    ],
    produce: [
        "Fresh tomatoes",
        "Organic cucumbers",
        "Mint bundle",
        "Fresh parsley",
        "Homegrown eggplant",
        "Bell peppers - mixed colors",
        "Fresh lettuce",
        "Zucchini harvest",
        "Green beans",
        "Fresh onions",
        "Garlic bulbs",
        "Strawberries - just picked",
    ],
    tools: [
        "Hand trowel set",
        "Watering can - 5L",
        "Pruning shears",
        "Seed starting trays",
        "Garden gloves",
        "Small shovel",
        "Plant stakes",
        "Drip irrigation kit",
        "Spray bottle",
        "Plant pots - various sizes",
    ],
    fertilizer: [
        "Homemade compost - 5kg",
        "Organic fertilizer",
        "Compost tea",
        "Worm castings",
        "Dried chicken manure",
        "Seaweed extract",
        "Fish emulsion",
        "Bone meal",
    ],
    other: [
        "Gardening book - Arabic",
        "Plant labels",
        "Shade cloth",
        "Mulch",
        "Rainwater barrel",
        "Grow lights",
        "pH testing kit",
    ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function weightedRandom<T>(items: Array<T & { weight: number }>): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
        random -= item.weight;
        if (random <= 0) return item;
    }
    return items[items.length - 1];
}

function randomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateGazaLocation(): { lat: number; lng: number; label: string } {
    const location = weightedRandom(GAZA_LOCATIONS);
    // Add small random offset (within ~500m)
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;

    return {
        lat: location.lat + latOffset,
        lng: location.lng + lngOffset,
        label: location.name,
    };
}

function generatePalestinianName(): { firstName: string; lastName: string; fullName: string } {
    const isMale = Math.random() > 0.5;
    const firstName = randomFromArray(isMale ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES);
    const lastName = randomFromArray(FAMILY_NAMES);
    return {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
    };
}

function generateFarmName(familyName: string): string {
    const pattern = randomFromArray(FARM_NAME_PATTERNS);
    return pattern.replace("{family}", familyName.split(" ").pop() || familyName);
}

function generateUserId(): string {
    return faker.string.uuid();
}

function randomDateInPast(months: number): Date {
    const now = new Date();
    const pastDate = new Date(now.getTime() - Math.random() * months * 30 * 24 * 60 * 60 * 1000);
    return pastDate;
}

function generateCrops(count: number): any[] {
    const crops: any[] = [];
    const usedPlants = new Set<string>();

    for (let i = 0; i < count; i++) {
        let plant;
        let attempts = 0;
        do {
            plant = weightedRandom(GAZA_SUITABLE_PLANTS);
            attempts++;
        } while (usedPlants.has(plant.id) && attempts < 10);

        if (usedPlants.has(plant.id)) continue;
        usedPlants.add(plant.id);

        const stages = ["seedling", "vegetative", "flowering", "fruiting", "mature"];

        crops.push({
            plantId: plant.id,
            plantName: plant.name,
            count: faker.number.int({ min: 1, max: 20 }),
            stage: randomFromArray(stages),
            plantedDate: randomDateInPast(3),
            notes: Math.random() > 0.7 ? faker.lorem.sentence() : undefined,
        });
    }

    return crops;
}

// ============================================================================
// DATA GENERATORS
// ============================================================================

interface GeneratedUser {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
}

function generateFarmProfile(user: GeneratedUser) {
    const location = generateGazaLocation();
    const crops = generateCrops(faker.number.int({ min: 0, max: 8 }));

    // Calculate daily water based on crops
    const dailyWaterLiters = crops.reduce((total, crop) => {
        return total + crop.count * faker.number.float({ min: 0.2, max: 1.5 });
    }, 0);

    return {
        userId: user.id,
        userName: user.name,
        farmName: generateFarmName(user.lastName),
        farmEmoji: randomFromArray(FARM_EMOJIS),
        waterAvailability: randomFromArray(["none", "low", "medium", "high"]),
        soilCondition: randomFromArray(["normal", "salty", "unknown"]),
        spaceType: randomFromArray(["rooftop", "balcony", "containers", "backyard", "microplot"]),
        sunlight: randomFromArray(["low", "medium", "high"]),
        primaryGoal: randomFromArray(["calories", "nutrition", "fast"]),
        experienceLevel: randomFromArray(["beginner", "intermediate", "advanced"]),
        latitude: location.lat,
        longitude: location.lng,
        locationLabel: location.label,
        country: "PS", // ISO code for Palestine
        crops,
        dailyWaterLiters: Math.round(dailyWaterLiters * 10) / 10,
        isPublic: Math.random() > 0.2, // 80% public
        onboardingCompleted: true,
        createdAt: randomDateInPast(6),
        updatedAt: randomDateInPast(1),
    };
}

function generateExchangeListing(user: GeneratedUser) {
    const location = generateGazaLocation();
    const type = randomFromArray(["seeds", "produce", "tools", "fertilizer", "other"]) as keyof typeof EXCHANGE_TITLES;
    const mode = randomFromArray(["offering", "seeking"]) as "offering" | "seeking";
    const dealType = randomFromArray(["price", "trade", "donation"]) as "price" | "trade" | "donation";

    const titles = EXCHANGE_TITLES[type];
    const title = randomFromArray(titles);

    // Generate appropriate description based on mode
    const description = mode === "offering"
        ? `${faker.lorem.sentence()} Available for pickup in ${location.label}.`
        : `Looking for ${title.toLowerCase()}. Can pick up from ${location.label} area.`;

    // Get image URL for this type (80% chance of having an image)
    const images = LISTING_IMAGES[type] || LISTING_IMAGES.other;
    const imageUrl = Math.random() > 0.2 ? randomFromArray(images) : undefined;

    const listing: any = {
        userId: user.id,
        userName: user.name,
        type,
        title,
        description,
        quantity: type === "produce"
            ? `${faker.number.int({ min: 1, max: 5 })} kg`
            : type === "seeds"
                ? `${faker.number.int({ min: 10, max: 100 })} seeds`
                : `${faker.number.int({ min: 1, max: 5 })} pieces`,
        imageUrl,
        mode,
        dealType,
        deliveryMethod: randomFromArray(["pickup", "walking", "bicycle"]),
        latitude: location.lat,
        longitude: location.lng,
        country: "PS",
        locationLabel: location.label,
        status: randomFromArray(["available", "available", "available", "claimed", "completed"]), // weighted towards available
        createdAt: randomDateInPast(3),
        updatedAt: randomDateInPast(1),
    };

    // Add deal-specific fields
    if (dealType === "price") {
        listing.price = faker.number.int({ min: 5, max: 100 });
        listing.currencyCountry = "PS"; // Will show as ILS or use local currency
    } else if (dealType === "trade") {
        listing.tradeItems = [
            randomFromArray(["Seeds", "Compost", "Tools", "Other produce", "Fertilizer"]),
        ];
    }

    // Link to plant if it's seeds or produce
    if (type === "seeds" || type === "produce") {
        const plant = weightedRandom(GAZA_SUITABLE_PLANTS);
        listing.plantId = plant.id;
    }

    return listing;
}

function generateCompostSite(user: GeneratedUser, index: number) {
    const location = generateGazaLocation();
    const siteType = randomFromArray(["community", "private", "commercial", "municipal"]) as any;

    const siteName = index < COMPOST_SITE_NAMES.length
        ? COMPOST_SITE_NAMES[index]
        : `${location.label} Compost Site ${index}`;

    const capacityKg = faker.number.int({ min: 50, max: 2000 });

    return {
        userId: user.id,
        userName: user.name,
        siteName,
        siteEmoji: randomFromArray(COMPOST_EMOJIS),
        description: `${siteType.charAt(0).toUpperCase() + siteType.slice(1)} composting facility in ${location.label}. ${faker.lorem.sentence()}`,
        siteType,
        acceptsWaste: Math.random() > 0.3,
        sellsFertilizer: Math.random() > 0.5,
        capacityKg,
        currentLoadKg: faker.number.int({ min: 0, max: Math.floor(capacityKg * 0.8) }),
        contactInfo: Math.random() > 0.3 ? `+970 ${faker.number.int({ min: 59, max: 59 })} ${faker.number.int({ min: 100, max: 999 })} ${faker.number.int({ min: 1000, max: 9999 })}` : undefined,
        latitude: location.lat,
        longitude: location.lng,
        locationLabel: location.label,
        country: "PS",
        isPublic: Math.random() > 0.1,
        isVerified: Math.random() > 0.6,
        createdAt: randomDateInPast(12),
        updatedAt: randomDateInPast(2),
    };
}

function generateExchangeClaim(
    listing: any,
    claimerUser: GeneratedUser,
    listingIndex: number
) {
    const statuses = ["pending", "confirmed", "completed", "cancelled"] as const;
    // Weight towards pending and confirmed for realism
    const statusWeights = [40, 30, 20, 10];
    let statusRandom = Math.random() * 100;
    let status: typeof statuses[number] = "pending";
    for (let i = 0; i < statuses.length; i++) {
        statusRandom -= statusWeights[i];
        if (statusRandom <= 0) {
            status = statuses[i];
            break;
        }
    }

    const location = generateGazaLocation();
    let message = randomFromArray(CLAIM_MESSAGES);
    message = message.replace("{location}", location.label);

    const claim: any = {
        listingId: `listing_${listingIndex}`, // Will be replaced with actual ObjectId
        ownerId: listing.userId,
        claimerId: claimerUser.id,
        claimerName: claimerUser.name,
        message,
        status,
        createdAt: randomDateInPast(2),
        updatedAt: randomDateInPast(1),
    };

    // Add trade offer if the listing is a trade type
    if (listing.dealType === "trade" && Math.random() > 0.3) {
        claim.tradeOffer = randomFromArray(TRADE_OFFERS);
    }

    return claim;
}

function generateWaterCalculation(user: GeneratedUser, farmProfile: any) {
    const entries: any[] = [];
    const results: any[] = [];
    let totalLiters = 0;

    // Use crops from the farm profile if available
    const crops = farmProfile?.crops || [];
    
    if (crops.length > 0) {
        for (const crop of crops) {
            const litersPerPlant = faker.number.float({ min: 0.2, max: 1.5, fractionDigits: 2 });
            const totalForCrop = litersPerPlant * crop.count;
            
            entries.push({
                plantId: crop.plantId,
                stage: crop.stage,
                count: crop.count,
            });

            results.push({
                plantId: crop.plantId,
                plantName: crop.plantName,
                stage: crop.stage,
                count: crop.count,
                litersPerPlant,
                totalLiters: Math.round(totalForCrop * 100) / 100,
            });

            totalLiters += totalForCrop;
        }
    } else {
        // Generate random entries if no farm profile crops
        const numEntries = faker.number.int({ min: 1, max: 5 });
        for (let i = 0; i < numEntries; i++) {
            const plant = weightedRandom(GAZA_SUITABLE_PLANTS);
            const stages = ["seedling", "vegetative", "flowering", "fruiting", "mature"] as const;
            const stage = randomFromArray([...stages]);
            const count = faker.number.int({ min: 1, max: 15 });
            const litersPerPlant = faker.number.float({ min: 0.2, max: 1.5, fractionDigits: 2 });
            const totalForCrop = litersPerPlant * count;

            entries.push({ plantId: plant.id, stage, count });
            results.push({
                plantId: plant.id,
                plantName: plant.name,
                stage,
                count,
                litersPerPlant,
                totalLiters: Math.round(totalForCrop * 100) / 100,
            });

            totalLiters += totalForCrop;
        }
    }

    // Pick 2-4 random tips
    const tips: string[] = [];
    const tipCount = faker.number.int({ min: 2, max: 4 });
    const shuffledTips = [...WATER_TIPS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < tipCount; i++) {
        tips.push(shuffledTips[i]);
    }

    return {
        userId: user.id,
        entries,
        totalLitersPerDay: Math.round(totalLiters * 100) / 100,
        results,
        tips,
        createdAt: randomDateInPast(3),
        updatedAt: randomDateInPast(1),
    };
}

function generatePlan(user: GeneratedUser, farmProfileId?: string) {
    // Generate 3-5 recommended crops
    const recommendedCrops: any[] = [];
    const numCrops = faker.number.int({ min: 3, max: 5 });
    const usedPlants = new Set<string>();

    const cropReasons = [
        "Well-suited to Gaza's Mediterranean climate",
        "Drought-tolerant and water-efficient",
        "Quick harvest time for food security",
        "High nutritional value for families",
        "Easy to grow in containers",
        "Salt-tolerant for coastal areas",
        "Traditional Palestinian crop",
        "Good for rooftop growing",
        "Provides continuous harvest",
        "Excellent for small spaces",
    ];

    for (let i = 0; i < numCrops; i++) {
        let plant;
        let attempts = 0;
        do {
            plant = weightedRandom(GAZA_SUITABLE_PLANTS);
            attempts++;
        } while (usedPlants.has(plant.id) && attempts < 10);

        if (usedPlants.has(plant.id)) continue;
        usedPlants.add(plant.id);

        recommendedCrops.push({
            cropName: plant.name,
            reason: randomFromArray(cropReasons),
            difficulty: randomFromArray(["easy", "medium", "hard"]),
            timeToHarvestDays: faker.number.int({ min: 30, max: 120 }),
        });
    }

    // Generate timeline
    const timeline = [
        {
            label: "Today",
            steps: [
                "Prepare growing containers or beds",
                "Check water supply availability",
                "Gather seeds or seedlings from exchange",
            ].slice(0, faker.number.int({ min: 2, max: 3 })),
        },
        {
            label: "This Week",
            steps: [
                "Plant seeds in prepared soil",
                "Set up drip irrigation if available",
                "Add mulch to retain moisture",
                "Install shade cloth for hot days",
            ].slice(0, faker.number.int({ min: 2, max: 4 })),
        },
        {
            label: "Week 2+",
            steps: [
                "Monitor seedling growth daily",
                "Adjust watering based on weather",
                "Watch for pests and treat organically",
                "Thin seedlings if overcrowded",
                "Begin harvesting quick-growing crops",
            ].slice(0, faker.number.int({ min: 3, max: 5 })),
        },
    ];

    // Generate setup checklist (4-6 items)
    const checklistCount = faker.number.int({ min: 4, max: 6 });
    const shuffledChecklist = [...SETUP_CHECKLIST_ITEMS].sort(() => Math.random() - 0.5);
    const setupChecklist = shuffledChecklist.slice(0, checklistCount);

    const fallbackNotes = [
        "Focus on water-efficient crops given current conditions.",
        "Consider container gardening if space is limited.",
        "Connect with local farmers for seed exchanges.",
        "Start with fast-growing crops for quick food production.",
        "Prioritize leafy greens for nutritional value.",
    ];

    return {
        userId: user.id,
        farmProfileId,
        recommendedCrops,
        timeline,
        setupChecklist,
        estimatedDailyWaterLiters: faker.number.float({ min: 5, max: 50, fractionDigits: 1 }),
        fallbackNotes: randomFromArray(fallbackNotes),
        createdAt: randomDateInPast(4),
        updatedAt: randomDateInPast(1),
    };
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seed() {
    console.log("🌱 Starting database seed for Gaza, Palestine...\n");

    // Connect to MongoDB
    const {
        MONGO_INITDB_ROOT_USERNAME,
        MONGO_INITDB_ROOT_PASSWORD,
        MONGO_DB_NAME,
        NODE_ENV,
    } = process.env;

    if (!MONGO_INITDB_ROOT_USERNAME || !MONGO_INITDB_ROOT_PASSWORD) {
        console.error("❌ Missing MongoDB credentials in environment variables");
        process.exit(1);
    }

    const isDev = NODE_ENV !== "production";
    const host = isDev ? "origin.a-warded.org" : "lifelines_mongo";
    const port = isDev ? 202 : 27017;
    const dbName = MONGO_DB_NAME || "lifelines";

    const user = encodeURIComponent(MONGO_INITDB_ROOT_USERNAME);
    const pass = encodeURIComponent(MONGO_INITDB_ROOT_PASSWORD);
    const uri = `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=admin`;

    console.log(`📡 Connecting to MongoDB at ${host}:${port}...`);

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
        console.log("✅ Connected to MongoDB\n");
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error);
        process.exit(1);
    }

    const db = mongoose.connection.db;
    if (!db) {
        console.error("❌ Database connection not established");
        process.exit(1);
    }

    // Configuration
    const CONFIG = {
        FARM_PROFILES: 75,
        EXCHANGE_LISTINGS: 150,
        COMPOST_SITES: 20,
        EXCHANGE_CLAIMS: 80,
        WATER_CALCULATIONS: 50,
        PLANS: 60,
    };

    // Generate users pool
    console.log("👥 Generating user pool...");
    const users: GeneratedUser[] = [];
    for (let i = 0; i < CONFIG.FARM_PROFILES + 30; i++) {
        const { firstName, lastName, fullName } = generatePalestinianName();
        users.push({
            id: generateUserId(),
            name: fullName,
            firstName,
            lastName,
        });
    }

    // Clear existing data
    console.log("🗑️  Clearing existing collections...");
    await db.collection("farmprofiles").deleteMany({});
    await db.collection("exchangelistings").deleteMany({});
    await db.collection("compostsites").deleteMany({});
    await db.collection("exchangeclaims").deleteMany({});
    await db.collection("watercalculations").deleteMany({});
    await db.collection("plans").deleteMany({});
    console.log("✅ Collections cleared\n");

    // Generate Farm Profiles
    console.log(`🏡 Generating ${CONFIG.FARM_PROFILES} farm profiles...`);
    const farmProfiles = [];
    for (let i = 0; i < CONFIG.FARM_PROFILES; i++) {
        farmProfiles.push(generateFarmProfile(users[i]));
    }
    await db.collection("farmprofiles").insertMany(farmProfiles);
    console.log(`✅ Inserted ${farmProfiles.length} farm profiles`);

    // Generate Exchange Listings
    console.log(`📦 Generating ${CONFIG.EXCHANGE_LISTINGS} exchange listings...`);
    const exchangeListings = [];
    for (let i = 0; i < CONFIG.EXCHANGE_LISTINGS; i++) {
        // Use users from farm profiles mostly, but some new users too
        const userIndex = Math.random() > 0.3
            ? i % CONFIG.FARM_PROFILES
            : faker.number.int({ min: 0, max: users.length - 1 });
        exchangeListings.push(generateExchangeListing(users[userIndex]));
    }
    await db.collection("exchangelistings").insertMany(exchangeListings);
    console.log(`✅ Inserted ${exchangeListings.length} exchange listings`);

    // Generate Compost Sites
    console.log(`♻️  Generating ${CONFIG.COMPOST_SITES} compost sites...`);
    const compostSites = [];
    for (let i = 0; i < CONFIG.COMPOST_SITES; i++) {
        // Mix of farm users and dedicated compost site operators
        const userIndex = Math.random() > 0.5
            ? i % Math.min(CONFIG.COMPOST_SITES, CONFIG.FARM_PROFILES)
            : faker.number.int({ min: CONFIG.FARM_PROFILES, max: users.length - 1 });
        compostSites.push(generateCompostSite(users[userIndex], i));
    }
    await db.collection("compostsites").insertMany(compostSites);
    console.log(`✅ Inserted ${compostSites.length} compost sites`);

    // Generate Exchange Claims (claims on existing listings)
    console.log(`🤝 Generating ${CONFIG.EXCHANGE_CLAIMS} exchange claims...`);
    const exchangeClaims = [];
    const insertedListings = await db.collection("exchangelistings").find({}).toArray();
    
    for (let i = 0; i < CONFIG.EXCHANGE_CLAIMS; i++) {
        // Pick a random listing to claim
        const listingIndex = faker.number.int({ min: 0, max: insertedListings.length - 1 });
        const listing = insertedListings[listingIndex];
        
        // Pick a claimer that is NOT the listing owner
        let claimerUser;
        let attempts = 0;
        do {
            claimerUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
            attempts++;
        } while (claimerUser.id === listing.userId && attempts < 10);

        const claim = generateExchangeClaim(listing, claimerUser, listingIndex);
        // Use actual MongoDB ObjectId from the inserted listing
        claim.listingId = listing._id.toString();
        exchangeClaims.push(claim);
    }
    await db.collection("exchangeclaims").insertMany(exchangeClaims);
    console.log(`✅ Inserted ${exchangeClaims.length} exchange claims`);

    // Generate Water Calculations
    console.log(`💧 Generating ${CONFIG.WATER_CALCULATIONS} water calculations...`);
    const waterCalculations = [];
    for (let i = 0; i < CONFIG.WATER_CALCULATIONS; i++) {
        // Use users who have farm profiles
        const userIndex = i % CONFIG.FARM_PROFILES;
        const farmProfile = farmProfiles[userIndex];
        waterCalculations.push(generateWaterCalculation(users[userIndex], farmProfile));
    }
    await db.collection("watercalculations").insertMany(waterCalculations);
    console.log(`✅ Inserted ${waterCalculations.length} water calculations`);

    // Generate Plans
    console.log(`📋 Generating ${CONFIG.PLANS} farming plans...`);
    const plans = [];
    const insertedFarmProfiles = await db.collection("farmprofiles").find({}).toArray();
    
    for (let i = 0; i < CONFIG.PLANS; i++) {
        const userIndex = i % CONFIG.FARM_PROFILES;
        // Link to farm profile if available
        const farmProfile = i < insertedFarmProfiles.length ? insertedFarmProfiles[i] : null;
        const plan = generatePlan(
            users[userIndex],
            farmProfile?._id?.toString()
        );
        plans.push(plan);
    }
    await db.collection("plans").insertMany(plans);
    console.log(`✅ Inserted ${plans.length} farming plans`);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Seed completed successfully!");
    console.log("=".repeat(50));
    console.log(`\n📊 Summary for Gaza, Palestine (Country: PS):`);
    console.log(`   • Farm Profiles:       ${farmProfiles.length}`);
    console.log(`   • Exchange Listings:   ${exchangeListings.length}`);
    console.log(`   • Exchange Claims:     ${exchangeClaims.length}`);
    console.log(`   • Compost Sites:       ${compostSites.length}`);
    console.log(`   • Water Calculations:  ${waterCalculations.length}`);
    console.log(`   • Farming Plans:       ${plans.length}`);
    console.log(`\n🗺️  Locations covered:`);

    const locationCounts: Record<string, number> = {};
    farmProfiles.forEach((f) => {
        locationCounts[f.locationLabel] = (locationCounts[f.locationLabel] || 0) + 1;
    });
    Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([loc, count]) => {
            console.log(`   • ${loc}: ${count} farms`);
        });

    console.log("\n🌿 Free Palestine 🇵🇸\n");

    await mongoose.disconnect();
    process.exit(0);
}

// Load environment variables and run
import { config } from "dotenv";
config({ path: ".env.local" });

seed().catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
});
