// /**
//  * Seed script for Forum Posts
//  * Run with: npx tsx scripts/seed-forum-posts.ts
//  */

// import mongoose from "mongoose";
// import { config } from "dotenv";

// // Load environment variables
// config({ path: ".env.local" });

// function getMongoUri() {
//     const {
//         NODE_ENV,
//         MONGO_INITDB_ROOT_USERNAME,
//         MONGO_INITDB_ROOT_PASSWORD,
//         MONGO_DB_NAME,
//     } = process.env;

//     const isDev = NODE_ENV !== "production";
//     const host = isDev ? "origin.a-warded.org" : "lifelines_mongo";
//     const port = isDev ? 202 : 27017;
//     const dbName = MONGO_DB_NAME || "lifelines";

//     if (!MONGO_INITDB_ROOT_USERNAME) {
//         throw new Error("Missing MONGO_INITDB_ROOT_USERNAME in .env.local");
//     }
//     if (!MONGO_INITDB_ROOT_PASSWORD) {
//         throw new Error("Missing MONGO_INITDB_ROOT_PASSWORD in .env.local");
//     }

//     const user = encodeURIComponent(MONGO_INITDB_ROOT_USERNAME);
//     const pass = encodeURIComponent(MONGO_INITDB_ROOT_PASSWORD);

//     return `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=admin`;
// }

// // Forum Post Schema (inline to avoid import issues)
// const ForumPostSchema = new mongoose.Schema({
//     userId: { type: String, required: true },
//     userName: { type: String, required: true },
//     title: { type: String, required: true },
//     content: { type: String, required: true },
//     category: {
//         type: String,
//         enum: ["composting", "water-saving", "seed-saving", "crop-rotation", "organic", "zero-waste", "general"],
//         default: "general",
//     },
//     journeyStage: {
//         type: String,
//         enum: ["seed", "growing", "harvest", "compost", "full-cycle"],
//     },
//     imageUrl: String,
//     country: String,
//     region: String,
//     likes: [{ type: String }],
//     commentCount: { type: Number, default: 0 },
//     isPinned: { type: Boolean, default: false },
//     isVerified: { type: Boolean, default: false },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
// });

// const ForumPost = mongoose.models.ForumPost || mongoose.model("ForumPost", ForumPostSchema);

// // Forum Comment Schema
// const ForumCommentSchema = new mongoose.Schema({
//     postId: { type: String, required: true, index: true },
//     userId: { type: String, required: true },
//     userName: { type: String },
//     content: { type: String, required: true, maxlength: 2000 },
//     likes: [{ type: String }],
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
// });

// const ForumComment = mongoose.models.ForumComment || mongoose.model("ForumComment", ForumCommentSchema);

// // Seed user IDs (simulated community members)
// const SEED_USERS = [
//     { id: "seed_user_001", name: "Abu Ahmad" },
//     { id: "seed_user_002", name: "Fatima Al-Masri" },
//     { id: "seed_user_003", name: "Mohammad Saleh" },
//     { id: "seed_user_004", name: "Umm Khalil" },
//     { id: "seed_user_005", name: "Youssef Ibrahim" },
//     { id: "seed_user_006", name: "Layla Hassan" },
//     { id: "seed_user_007", name: "Khaled Abu Nasser" },
//     { id: "seed_user_008", name: "Mariam Darwish" },
//     { id: "seed_user_009", name: "Omar Al-Najjar" },
//     { id: "seed_user_010", name: "Hana Barakat" },
//     { id: "seed_user_011", name: "Ibrahim Qassem" },
//     { id: "seed_user_012", name: "Samira Odeh" },
//     { id: "seed_user_013", name: "Nabil Khalidi" },
//     { id: "seed_user_014", name: "Rania Abu Zahra" },
//     { id: "seed_user_015", name: "Tariq Mansour" },
// ];

// // Sample comments for realistic community discussion
// const SAMPLE_COMMENTS = [
//     // Supportive and grateful
//     "This is exactly what I needed. Thank you for sharing your wisdom with us.",
//     "I tried this last week and it works beautifully. My plants are thriving now.",
//     "May Allah bless you for helping our community. This knowledge saves lives.",
//     "I shared this with my neighbors and they are all grateful.",
//     "This is traditional knowledge that our grandparents used. So glad to see it preserved.",
//     "I have been struggling with this problem for months. Your solution is simple and effective.",
//     "Thank you brother/sister for taking time to write this detailed guide.",
//     "My mother used to do something similar. Thank you for reminding us.",
//     "This is sustainable farming at its best. No expensive inputs needed.",
//     "I will try this tomorrow, inshallah. Thank you for the clear instructions.",
    
//     // Adding personal experience
//     "I do something similar but add a bit of ash from cooking fire. Works even better.",
//     "In my experience, this works best during spring. Summer heat can be challenging.",
//     "I modified this technique slightly for my rooftop garden. Happy to share if interested.",
//     "We have been doing this for three generations in our family. Confirmed it works.",
//     "I found that adding some crushed eggshells improves the results significantly.",
//     "Works great with tomatoes and peppers. Still experimenting with other crops.",
//     "My neighbor tried this and his yield increased by almost double.",
//     "I combined this with another technique I learned here. The results are amazing.",
//     "This saved my cucumber crop last season. Cannot thank you enough.",
//     "After some trial and error, I found the best timing is early morning.",
    
//     // Questions and clarifications
//     "Can this be used for fruit trees as well, or only vegetables?",
//     "How often should we repeat this process? Daily or weekly?",
//     "What if we don't have access to the materials you mentioned? Any alternatives?",
//     "Does this work equally well in containers or only in ground soil?",
//     "I'm new to farming. Can you explain the first step in more detail?",
//     "What is the best season to start implementing this technique?",
//     "How do you handle this during the hot summer months?",
//     "Is there a way to scale this up for larger plots?",
//     "Can children help with this safely? I want to teach my kids.",
//     "What are the signs that this is working properly?",
    
//     // Sharing additional tips
//     "Pro tip: Do this early morning or late evening for best results.",
//     "I learned from my father: patience is key. Give it at least two weeks.",
//     "One thing to add: make sure your soil is not compacted first.",
//     "Important note: this works better with compost-enriched soil.",
//     "From my experience, start small and expand once you see success.",
//     "Don't forget to observe your plants daily. They will tell you what they need.",
//     "A small addition: rainwater works better than tap water for this.",
//     "My grandmother's secret: talk to your plants while doing this. They listen.",
//     "Remember to share your success with neighbors. We rise together.",
//     "Key insight: consistency matters more than perfection.",
    
//     // Community building
//     "Let's organize a workshop in the neighborhood to teach this to everyone.",
//     "I can share seeds with anyone who wants to try this technique.",
//     "Who else in Khan Younis is trying this? We should connect.",
//     "Our women's cooperative is implementing this. Thank you for the guide.",
//     "The youth center is teaching this to children now. Beautiful to see.",
//     "We should document all these techniques for future generations.",
//     "This forum is truly a blessing for our farming community.",
//     "Knowledge sharing like this is what will help us survive and thrive.",
//     "I feel hopeful seeing our community help each other like this.",
//     "Together we are stronger. Thank you all for contributing.",
    
//     // Technical feedback
//     "The ratios you mentioned work perfectly. Tested and confirmed.",
//     "I adjusted the measurements slightly for my clay soil. Works great.",
//     "Your timing suggestions are accurate. Tested over three months.",
//     "The method is sound. I have a background in agriculture and approve.",
//     "Scientific principle behind this is solid. Well explained.",
//     "I documented my results: 40% improvement in just one month.",
//     "Temperature matters more than I thought. Your advice was correct.",
//     "The drainage tip you mentioned is crucial. Don't skip it.",
//     "pH levels improved after following your instructions.",
//     "Soil moisture retention increased significantly. Measurable difference.",
    
//     // Emotional and resilient
//     "In these difficult times, such knowledge gives us hope.",
//     "Farming connects us to our land. Thank you for keeping this alive.",
//     "Our ancestors farmed this land for generations. We will continue.",
//     "Every seed planted is an act of resistance and hope.",
//     "This community keeps me going. Thank you all.",
//     "When I see my garden grow, I feel peace despite everything.",
//     "Teaching my children to farm is teaching them to survive.",
//     "The land gives back what we give it. Your technique proves this.",
//     "We may have little, but we have each other and this knowledge.",
//     "Gardens are healing spaces. Thank you for helping us create them.",
    
//     // Practical offers to help
//     "I have extra seeds if anyone needs them. Message me.",
//     "Happy to visit and help set this up for elderly neighbors.",
//     "Our family has tools we can share. Let us know if needed.",
//     "I can translate this into English for relatives abroad.",
//     "Will print this guide for those without internet access.",
//     "Our community center can host a demonstration. Who's interested?",
//     "I have compost ready if anyone needs some to start.",
//     "Can provide cuttings from my herbs for anyone nearby.",
//     "My uncle has a truck - can help transport materials.",
//     "Youth volunteers available to help implement this in your garden.",
// ];

// function randomComment(): string {
//     return SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)];
// }

// function randomUser() {
//     return SEED_USERS[Math.floor(Math.random() * SEED_USERS.length)];
// }

// function randomLikes(max: number = 25): string[] {
//     const count = Math.floor(Math.random() * max);
//     const likes: string[] = [];
//     for (let i = 0; i < count; i++) {
//         likes.push(`like_user_${Math.floor(Math.random() * 1000)}`);
//     }
//     return likes;
// }

// function randomDate(daysBack: number = 180): Date {
//     const now = new Date();
//     const past = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
//     return past;
// }

// // ============================================================================
// // SEED POSTS DATA - 150 posts for Gaza farming community
// // ============================================================================

// const FORUM_POSTS = [
//     // ========== WATER SAVING (30 posts) ==========
//     {
//         title: "Drip Irrigation from Recycled Bottles - Complete Guide",
//         content: `## Simple Drip System Anyone Can Build

// After years of struggling with water scarcity, I developed this system that **reduced my water usage by 60%**.

// ### Materials Needed:
// - 2-liter plastic bottles (collect from neighbors)
// - Small nail or needle
// - String or wire for hanging

// ### Steps:
// 1. Clean bottles thoroughly
// 2. Make **2-3 small holes** near the bottom
// 3. Bury bottle neck-down next to plant roots
// 4. Fill with water - it slowly releases over 2-3 days

// ### Pro Tips:
// - Add holes gradually - start with fewer
// - Cover exposed bottle with mulch to prevent algae
// - Works best for tomatoes, peppers, and eggplants

// *This method saved my summer crop during the water cuts last year.*`,
//         category: "water-saving",
//         journeyStage: "growing",
//         isVerified: true,
//         isPinned: true,
//     },
//     {
//         title: "Collecting Morning Dew - Ancient Technique Revived",
//         content: `Our grandparents knew something we forgot. **Morning dew collection** can provide significant water for small gardens.

// ## How It Works:
// Spread clean plastic sheets or large leaves over the soil in the evening. By morning, condensation collects underneath.

// ### Best Practices:
// - Use **dark colored sheets** - they cool faster at night
// - Angle sheets slightly toward collection point
// - Works best during **spring and fall** when temperature differences are greatest

// I collect about **2-3 liters per 10 square meters** on good mornings. Not much, but for seedlings it makes a difference.

// > "Every drop counts when water is life" - my grandmother`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Grey Water Treatment for Garden Use",
//         content: `## Safe Reuse of Household Water

// With proper treatment, **kitchen and washing water** can irrigate your vegetables safely.

// ### What's Safe to Reuse:
// - Vegetable washing water (best - use immediately)
// - Rinse water from laundry (avoid first wash with soap)
// - Pasta/rice cooking water (nutrients included!)

// ### What to Avoid:
// - Water with bleach or harsh chemicals
// - Toilet water (obviously)
// - Very soapy water

// ### Simple Treatment:
// 1. Let water sit for 24 hours in sun (UV treatment)
// 2. Filter through cloth and sand layer
// 3. Use within 48 hours

// **Warning:** Don't use on leafy greens you eat raw. Best for fruit trees and root vegetables.`,
//         category: "water-saving",
//         journeyStage: "growing",
//         isVerified: true,
//     },
//     {
//         title: "Mulching Reduced My Watering by Half",
//         content: `Brothers and sisters, if you're not mulching, you're wasting water.

// ## What I Use for Mulch:
// - Dried grass clippings
// - Cardboard (free from shops)
// - Old newspapers (avoid colored ink)
// - Dried leaves
// - Straw when available

// ### Results After One Season:
// - Watering frequency: **Every 3-4 days instead of daily**
// - Soil temperature: 10°C cooler in summer
// - Fewer weeds (bonus!)

// Layer it **8-10cm thick** around plants but keep it away from stems to prevent rot.

// The cardboard trick: Lay it flat, wet it, cover with other mulch. It blocks weeds completely and decomposes into the soil.`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Best Watering Times for Gaza Climate",
//         content: `## Stop Wasting Water to Evaporation!

// After measuring soil moisture at different times, here's what I found:

// ### Optimal Watering Schedule:
// - **Best:** Just before sunrise (5:00-6:00 AM)
// - **Good:** After sunset (7:00-8:00 PM)
// - **Worst:** Midday (loses 40% to evaporation!)

// ### Seasonal Adjustments:
// - **Summer:** Early morning only, deeper and less frequent
// - **Winter:** Late morning, let soil dry between waterings
// - **Spring/Fall:** Evening works well

// **Important:** Water the soil, not the leaves. Wet leaves in our humid coastal air = fungal diseases.`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Building a Simple Wicking Bed",
//         content: `## Self-Watering Garden Beds

// Wicking beds **water from below**, reducing waste and labor.

// ### Construction:
// 1. Build raised bed (60cm tall minimum)
// 2. Line bottom with pond liner or thick plastic
// 3. Add 15cm gravel layer
// 4. Insert overflow pipe at gravel level
// 5. Add geotextile fabric
// 6. Fill with soil/compost mix
// 7. Install fill pipe reaching to gravel

// ### How It Works:
// Water fills reservoir at bottom. Soil wicks moisture up to roots. You only refill when reservoir empties.

// **Result:** Water once per week even in summer. Plants always have access to moisture without drowning.

// Cost me about 200 shekels to build 1x2 meter bed. Worth every agora.`,
//         category: "water-saving",
//         journeyStage: "growing",
//         isVerified: true,
//     },
//     {
//         title: "Clay Pot Irrigation (Olla Method)",
//         content: `This ancient technique works perfectly for us.

// ## What You Need:
// - Unglazed clay pots (the cheap ones from the market)
// - Cork or clay to seal drainage hole

// ### Setup:
// 1. Seal the drainage hole
// 2. Bury pot up to neck near plants
// 3. Fill with water
// 4. Cover top to prevent evaporation

// Water seeps through the clay walls slowly, directly to root zone. One pot waters about 1 meter radius.

// **Efficiency:** Nearly 100% - no surface evaporation, no runoff.

// My tomatoes with olla irrigation produced **30% more fruit** than drip-irrigated ones.`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Rainwater Harvesting from Rooftops",
//         content: `## Don't Let Winter Rains Go to Waste

// Even with our short rainy season, you can collect **thousands of liters**.

// ### Simple Collection System:
// 1. Clean roof gutters
// 2. Direct downspout to collection tank
// 3. Add mesh filter to keep debris out
// 4. First flush diverter (dumps first dirty water)

// ### Storage Tips:
// - Keep tanks covered (mosquitoes!)
// - Dark containers prevent algae
// - Add a few drops of vegetable oil on surface

// ### Capacity Math:
// 100 square meter roof × 500mm annual rainfall = **50,000 liters potential**

// Even collecting 20% of that changes everything for summer irrigation.`,
//         category: "water-saving",
//         journeyStage: "full-cycle",
//         isVerified: true,
//     },
//     {
//         title: "Shade Cloth Reduces Water Needs",
//         content: `Installing **40% shade cloth** over my summer garden was a game changer.

// ## Benefits I Measured:
// - Soil stays moist 2x longer
// - Plants less stressed at midday
// - Reduced sunscald on tomatoes and peppers
// - Watering reduced from daily to every 2-3 days

// ### Best Setup:
// - Height: 2 meters above plants (allows air flow)
// - Orientation: Tilted to block afternoon sun
// - Material: Green or black (not white - reflects too much)

// Cost about 50 shekels per meter. Lasted 3 seasons so far. The water savings paid for it in the first month.`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Deep Watering Technique for Fruit Trees",
//         content: `Most people water trees wrong - shallow and often. This wastes water and makes trees weak.

// ## Correct Method:
// 1. Create basin around tree (1 meter diameter)
// 2. Build up rim to hold water
// 3. Fill basin completely
// 4. Let it soak in fully
// 5. Wait until soil dries to 20cm depth before next watering

// ### Frequency:
// - Newly planted: Weekly for first year
// - Established: Every 2-3 weeks in summer
// - Winter: Only if no rain for 3+ weeks

// **Deep watering = deep roots = drought-resistant trees**

// My 5-year-old lemon tree survived last summer's water crisis with only monthly deep watering.`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Swales and Berms for Water Retention",
//         content: `## Earthworks That Hold Water in Your Land

// If your land has any slope, you're losing water. Swales fix this.

// ### What's a Swale?
// A shallow ditch on contour (following the same elevation) with a raised berm on the downhill side.

// ### How to Build:
// 1. Find the contour using A-frame level or water level
// 2. Dig trench 30cm deep, 60cm wide
// 3. Pile soil on downhill side
// 4. Plant berm with deep-rooted plants

// ### What Happens:
// Rain runs into swale, soaks into ground slowly, spreads sideways underground. Trees planted on berms access this stored moisture.

// I have 3 swales on my 500 square meter plot. Haven't watered my olive trees since installing them 2 years ago.`,
//         category: "water-saving",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Water-Efficient Crop Selection",
//         content: `## Grow What Fits Our Climate

// Some crops need 3x more water than others for same nutrition. Choose wisely.

// ### Low Water Crops (Recommended):
// - **Vegetables:** Okra, cowpeas, sweet potato, squash
// - **Herbs:** Rosemary, thyme, sage, za'atar
// - **Fruits:** Fig, pomegranate, jujube, prickly pear

// ### High Water Crops (Avoid or Minimize):
// - Celery, lettuce (especially in summer)
// - Beans (spring only)
// - Corn (very thirsty)

// ### Middle Ground:
// - Tomatoes (manageable with drip)
// - Peppers (with mulch)
// - Eggplant (surprisingly efficient)

// **Pro tip:** Grow water-hungry crops in winter/spring only. Summer is for drought-tolerant varieties.`,
//         category: "water-saving",
//         journeyStage: "seed",
//     },
//     {
//         title: "Sunken Beds for Arid Conditions",
//         content: `Opposite of raised beds - and better for our dry climate.

// ## Why Sunken Works Here:
// - Collects any rainfall
// - Shaded from drying winds
// - Cooler soil temperature
// - Moisture stays longer

// ### How to Build:
// 1. Dig down 30-40cm
// 2. Keep the excavated soil as berms around edges
// 3. Add compost to bottom
// 4. Plant in the depression

// ### Best For:
// - Squash family (watermelon, pumpkin, cucumber)
// - Fruit trees when young
// - Any crop during summer months

// Combined with mulch, my sunken melon bed needed water only **once per week** while neighbors watered daily.`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Recycling Air Conditioner Water",
//         content: `Our AC units produce **10-20 liters daily** of pure distilled water. Don't waste it!

// ## Collection Method:
// 1. Extend the drain pipe to a bucket
// 2. Or pipe directly to garden

// ### Quality:
// - Distilled = no minerals, no chlorine
// - Perfect for seedlings
// - Good for mixing with fertilizer (won't react)

// ### Caution:
// - Don't let it stagnate (mosquitoes)
// - Use within 24 hours
// - Keep collection clean

// Five AC units in my building = 100 liters daily for the community garden. Free water that was just dripping onto the street!`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Companion Planting for Water Efficiency",
//         content: `## Plants That Help Each Other Use Water Better

// Strategic planting reduces overall water needs.

// ### Winning Combinations:
// - **Corn + Squash + Beans (Three Sisters)**
//   Squash leaves shade soil, beans fix nitrogen, corn provides structure
  
// - **Tomatoes + Basil**
//   Basil's aroma may reduce pests, shares water efficiently
  
// - **Fruit trees + Ground cover**
//   Clover or purslane under trees, living mulch

// ### Spacing Matters:
// Dense planting shades soil = less evaporation
// But too dense = competition for water

// Find the balance. I plant 20% closer than package suggests, with extra compost.`,
//         category: "water-saving",
//         journeyStage: "seed",
//     },
//     {
//         title: "Signs Your Plants Need Water vs Overwatering",
//         content: `## Learn to Read Your Plants

// Overwatering wastes water AND kills plants. Here's how to tell:

// ### Underwatering Signs:
// - Wilting in morning (wilting in afternoon heat is normal)
// - Leaves curling inward
// - Dry, crumbly soil
// - Older leaves yellowing and dropping

// ### Overwatering Signs:
// - Wilting despite wet soil
// - Leaves yellowing from bottom
// - Fungus gnats flying around
// - Root rot smell
// - Mushy stem base

// ### The Finger Test:
// Push finger 5cm into soil. Dry = water. Moist = wait.

// **Rule:** When in doubt, don't water. Most plants survive drought better than drowning.`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Hugelkultur Beds Hold Moisture for Months",
//         content: `## Buried Wood = Underground Water Tank

// This German technique is perfect for our conditions.

// ### How to Build:
// 1. Dig trench 60cm deep
// 2. Fill with logs and branches
// 3. Add leaves and green waste
// 4. Cover with soil
// 5. Plant on top

// ### Why It Works:
// Buried wood acts like a sponge, absorbing water and releasing it slowly over years. As wood decomposes, it becomes even more absorbent.

// **My Experience:**
// Built hugelkultur bed 2 years ago. Didn't water it at all this past summer. Squash and melons still produced well.

// Use any wood except walnut (toxic) and cedar (slow to decompose).`,
//         category: "water-saving",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Emergency Water Storage for Gardens",
//         content: `## Be Prepared for Water Cuts

// When water service is unreliable, preparation is survival.

// ### Storage Options:
// - Old food barrels (free from restaurants)
// - IBC tanks (1000 liter cubes)
// - Underground cisterns (old method, still best)

// ### Treatment for Long Storage:
// - 4 drops bleach per liter (dissipates before using on plants)
// - Keep covered and dark
// - Use first-in-first-out rotation

// ### During Cuts:
// - Prioritize perennial plants
// - Let annuals that are finishing go
// - Focus on seed-producers you need

// *Last summer's 2-week water cut would have killed everything. My stored 2000 liters saved the orchard.*`,
//         category: "water-saving",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Wind Breaks Reduce Water Loss",
//         content: `Hot wind can suck moisture from your garden faster than the sun.

// ## Effective Windbreaks:
// - **Living:** Rows of sorghum, sunflowers, or castor bean
// - **Structural:** Reed mats, shade cloth, old sheets

// ### Placement:
// - Identify prevailing wind direction (usually west in summer)
// - Place barrier 2-3 meters from plants
// - 50% permeable is better than solid (reduces turbulence)

// ### Results:
// - Reduced evaporation 30-40%
// - Plants less stressed
// - Better fruit set on tomatoes and peppers

// I use a double row of Sudan grass on the west side. Grows fast, can be cut for mulch, regrows.`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Toilet Paper Roll Irrigation Hack",
//         content: `Simple, free, and surprisingly effective.

// ## Method:
// 1. Save toilet paper cardboard tubes
// 2. Bury vertically next to plants, 2cm above soil
// 3. Pour water directly into tube

// ### Benefits:
// - Water goes straight to root zone
// - No surface waste
// - Tube decomposes and adds carbon
// - Easy to see when plant needs water (tube is empty)

// Works great for individual tomato plants, peppers, eggplants. I put 2-3 tubes around each plant.

// **Free, biodegradable, efficient.** Sometimes the best solutions are the simplest.`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },

//     // ========== COMPOSTING (25 posts) ==========
//     {
//         title: "Hot Composting in 18 Days - Gaza Method",
//         content: `## Fast Compost for Impatient Gardeners

// Don't wait 6 months. With this method, get finished compost in **18-21 days**.

// ### Ingredients (by volume):
// - 3 parts brown (dry leaves, cardboard, straw)
// - 1 part green (kitchen scraps, fresh grass)
// - Handful of finished compost or soil (inoculant)

// ### The Process:
// 1. **Day 1:** Build pile at least 1 cubic meter
// 2. **Day 4:** Turn completely
// 3. **Day 7:** Turn again
// 4. **Day 10, 13, 16:** Turn each time
// 5. **Day 18-21:** Done!

// ### Key Requirements:
// - Pile must heat to 55-65°C (kills seeds and pathogens)
// - Keep moist like wrung-out sponge
// - Oxygen from turning is essential

// *I make 4-5 batches through the year. Never buy fertilizer anymore.*`,
//         category: "composting",
//         journeyStage: "compost",
//         isVerified: true,
//         isPinned: true,
//     },
//     {
//         title: "Composting Kitchen Scraps Without Smell",
//         content: `Many neighbors don't compost because they fear smell. Here's the solution:

// ## Rules for Odor-Free Composting:
// 1. **Always cover greens with browns** - Layer scraps with dry leaves or newspaper
// 2. **No meat or dairy** - Attracts pests and smells
// 3. **Chop small** - Decomposes faster
// 4. **Drain excess liquid** - Too wet = anaerobic = smelly

// ### Covered Bucket System:
// Keep a bucket with tight lid in kitchen. Layer of sawdust at bottom. Add scraps, cover with sawdust. Empty to main pile weekly.

// ### If It Smells:
// - Add more browns
// - Turn to add oxygen
// - Check moisture (should not be soggy)

// My compost bin is 3 meters from my kitchen window. No smell ever.`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Bokashi Composting for Small Spaces",
//         content: `## Fermented Composting in a Bucket

// For apartment dwellers or tiny gardens, Bokashi works indoors.

// ### How It Works:
// - Anaerobic fermentation (opposite of regular composting)
// - Uses special bran inoculated with beneficial microbes
// - Takes 2 weeks to ferment
// - Then bury for 2 weeks to finish

// ### What You Can Add:
// - **Everything** - including meat, dairy, cooked food
// - Citrus, onions - no problem
// - All kitchen waste

// ### Process:
// 1. Add scraps to bucket
// 2. Sprinkle with Bokashi bran
// 3. Press down firmly (no air)
// 4. Drain liquid every 2-3 days (dilute for fertilizer)
// 5. When full, seal for 2 weeks

// **Bokashi liquid** diluted 1:100 is excellent fertilizer. Plants love it.`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Making Compost Tea for Liquid Fertilizer",
//         content: `## Multiply Your Compost's Power

// Turn one bucket of compost into **hundreds of liters** of fertilizer.

// ### Simple Passive Tea:
// 1. Fill burlap sack with finished compost
// 2. Suspend in barrel of water
// 3. Let steep 3-5 days
// 4. Remove sack, use liquid

// ### Aerated Tea (More Potent):
// 1. Same setup but add aquarium air pump
// 2. Bubble for 24-48 hours
// 3. Use immediately (living biology)

// ### Application:
// - Dilute to tea color
// - Soil drench: 1 liter per plant weekly
// - Foliar spray: Early morning, strain well

// **My observation:** Plants fed compost tea have better disease resistance than chemical fertilizer plants.`,
//         category: "composting",
//         journeyStage: "compost",
//         isVerified: true,
//     },
//     {
//         title: "Vermicomposting with Local Worms",
//         content: `## Red Worms Turn Waste into Black Gold

// Worm composting is fast, clean, and produces the best compost.

// ### Getting Started:
// - Container: Old bathtub, wooden box, or plastic bins
// - Bedding: Shredded newspaper, cardboard, dried leaves
// - Worms: Red wigglers (not earthworms) - ask around, someone has extras

// ### Feeding:
// - Small amounts daily better than large dumps
// - Bury food under bedding
// - Avoid: Citrus, onions, spicy food, meat

// ### Harvesting:
// - Push finished compost to one side
// - Add new bedding and food to other side
// - Worms migrate, harvest empty side

// **Yield:** 1 kg worms process 0.5 kg scraps daily. One bin handles small family's kitchen waste.`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Composting Olive Pressing Waste (Jeft)",
//         content: `## Turn This Problem Into Garden Gold

// After pressing season, olive waste is everywhere. Don't burn it - compost it!

// ### Challenges:
// - Very acidite (pH around 4)
// - Contains oil residue
// - Slow to decompose alone

// ### Solutions:
// 1. Mix 1:3 with high-nitrogen materials (grass, manure)
// 2. Add wood ash to balance pH
// 3. Turn frequently - needs lots of oxygen
// 4. Takes 4-6 months (patient composting)

// ### Result:
// Rich, dark compost perfect for fruit trees. The oil content becomes beneficial fatty acids for soil life.

// *Our village composts collectively - 50 families contribute to shared piles. Everyone gets compost in spring.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Cardboard as Compost Brown Material",
//         content: `Free, abundant, and perfect carbon source.

// ## Best Cardboard Types:
// - Plain corrugated boxes (best)
// - Egg cartons
// - Toilet paper rolls
// - Brown paper bags

// ### Avoid:
// - Glossy/coated cardboard
// - Colored printing (some ok, avoid heavy)
// - Tape (remove it)
// - Waxed cardboard

// ### Preparation:
// 1. Remove any tape and labels
// 2. Shred or tear into small pieces
// 3. Wet before adding to pile
// 4. Mix with greens

// ### Bonus Use:
// Lay flat cardboard as weed barrier, cover with mulch. Decomposes over season, improves soil.

// I collect from local shops - they're happy to have it taken away.`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Trench Composting - Lazy Method",
//         content: `## No Pile, No Turning, No Work

// Perfect for those who don't want to manage a compost pile.

// ### Method:
// 1. Dig trench 30cm deep between garden rows
// 2. Fill with kitchen scraps as you generate them
// 3. Cover each addition with soil
// 4. Plant over it next season

// ### Advantages:
// - No attracting pests (buried)
// - No smell (covered)
// - No turning needed
// - Improves soil exactly where needed

// ### Rotation:
// Move trench location each season. After 3-4 years, whole garden has been improved.

// *I've used this exclusively for 5 years. Never bought a compost bin. Soil is better than ever.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Using Chicken Manure Safely",
//         content: `## Powerful But Dangerous If Misused

// Chicken manure is available everywhere but can burn plants if used wrong.

// ### Fresh Manure - NEVER Use Directly!
// - Too much nitrogen (will burn roots)
// - May contain pathogens
// - Very high ammonia

// ### Safe Methods:
// 1. **Compost first** - Mix 1:4 with straw/leaves, age 3+ months
// 2. **Aged dry** - Collect dry, aged manure, still dilute
// 3. **Tea** - Soak in water 2 weeks, dilute 1:10

// ### Application Rates:
// - Composted: 2-3 kg per square meter
// - Never touch plant stems
// - Apply in fall for spring planting

// **Warning:** Don't use within 60 days of harvest for food safety.`,
//         category: "composting",
//         journeyStage: "compost",
//         isVerified: true,
//     },
//     {
//         title: "Composting in Extreme Heat",
//         content: `## Summer Composting Challenges and Solutions

// Our 40°C summers make composting both easier and harder.

// ### Advantages:
// - Faster decomposition
// - Kills pathogens efficiently
// - No need for insulation

// ### Challenges:
// - Dries out quickly
// - Can get too hot (kills beneficial organisms)
// - Needs more attention

// ### Adaptations:
// - **Location:** North side of building, afternoon shade
// - **Watering:** Check moisture daily, add water as needed
// - **Cover:** Use old carpet or plastic to hold moisture
// - **Depth:** Make piles deeper (1.5m) to retain moisture in center

// *Summer compost finishes in half the time, but only if you keep it wet enough.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Creating Compost Activators from Kitchen",
//         content: `## Speed Up Decomposition with These Boosters

// No need to buy expensive activators. Make them free.

// ### Natural Activators:
// - **Urine** - Yes, really. Dilute 1:10, high nitrogen
// - **Coffee grounds** - Nitrogen + attracts worms
// - **Old yogurt/milk** - Feeds bacteria
// - **Nettle or comfrey leaves** - High nitrogen plants
// - **Finished compost** - Contains needed microbes

// ### Application:
// When building pile or when it slows down, add a few liters of activator liquid or handful of material.

// ### Avoid:
// - Too much of anything
// - Meat-based additions
// - Bleach or chemicals

// *A handful of old compost is the best free activator. Contains millions of decomposers ready to work.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Sheet Composting for New Garden Beds",
//         content: `## Build Soil Without a Compost Pile

// Transform any area into fertile garden bed in one season.

// ### Lasagna Method:
// 1. **Layer 1:** Cardboard on ground (wet it)
// 2. **Layer 2:** 10cm brown material (leaves, straw)
// 3. **Layer 3:** 5cm green material (scraps, grass)
// 4. **Repeat:** 2-3 more times
// 5. **Top:** 10cm finished compost or soil

// ### Timeline:
// - Build in fall
// - Ready for planting by spring
// - Can plant immediately in top layer

// ### What Goes Wrong:
// - Layers too thick (won't decompose)
// - Too much green (smells, attracts pests)
// - Not enough water

// I built three beds this way. Saved me from having to remove rocky soil - just built on top of it.`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Composting Seaweed and Marine Debris",
//         content: `## Coastal Resource Most People Ignore

// Living by the sea gives us access to excellent compost materials.

// ### Seaweed Benefits:
// - Rich in trace minerals
// - Contains natural growth hormones
// - Breaks down quickly
// - No weed seeds!

// ### Preparation:
// - Rinse briefly to remove excess salt (or don't - small amount is fine)
// - Chop or shred for faster decomposition
// - Mix with land-based materials

// ### Salt Concerns:
// Minor salt content actually benefits plants. Don't rinse excessively.

// ### Other Marine Materials:
// - Fish waste (bury deep or use in Bokashi)
// - Crushed shells (calcium, slow release)

// *One wheelbarrow of seaweed per month keeps my pile cooking all year.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Signs Your Compost is Ready",
//         content: `## Don't Use It Too Early, Don't Wait Too Long

// ### Ready Compost Looks Like:
// - Dark brown to black color
// - Earthy smell (like forest floor)
// - Crumbly texture
// - No recognizable materials (except maybe wood)
// - Room temperature (not hot inside)

// ### Not Ready Signs:
// - Ammonia smell
// - Hot in center
// - Recognizable food scraps
// - Slimy texture
// - Sour smell

// ### The Test:
// Put handful in sealed plastic bag for a week. If it still smells good when opened, it's ready. If sour or ammonia smell, needs more time.

// **Using unfinished compost:** Ties up nitrogen, may burn plants, can spread diseases. Be patient!`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Pallet Compost Bins - Free and Easy",
//         content: `## Build Professional Bins for Zero Cost

// Wooden pallets make perfect three-bin system.

// ### Materials:
// - 4 pallets per bin (or 10 for 3-bin system)
// - Wire, nails, or zip ties
// - That's it!

// ### Construction:
// 1. Stand pallets on edge, forming U-shape
// 2. Secure corners with wire
// 3. Front can be removable for easy access

// ### Three-Bin System:
// - **Bin 1:** Active pile (adding to)
// - **Bin 2:** Cooking (turned from Bin 1)
// - **Bin 3:** Finished (curing)

// ### Improvements:
// - Add cardboard lining to retain moisture
// - Chicken wire keeps sides tidier
// - Old carpet or plastic as lid

// *Got 12 pallets free from industrial area. Built complete composting station that handles all neighborhood waste.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Composting Fallen Citrus Fruit",
//         content: `## Don't Waste Dropped Oranges and Lemons

// Many say citrus can't be composted. Not true - just needs management.

// ### Challenges:
// - Acidic (slows decomposition)
// - Oils can be antimicrobial
// - Attractive to fruit flies

// ### Solutions:
// 1. **Chop small** - More surface area = faster breakdown
// 2. **Balance with alkaline** - Add wood ash or crusite
// 3. **Mix well** - Don't let citrus clump
// 4. **Hot composting** - Heat overcomes antimicrobial oils

// ### Amounts:
// Keep citrus to less than 20% of pile. Too much slows everything.

// *I add all fallen citrus from my 3 trees. No problems. Just balance and mix.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Using Compost as Mulch vs Soil Amendment",
//         content: `## Two Uses, Different Applications

// Finished compost works two ways. Know when to use each.

// ### As Soil Amendment:
// - Work into top 15cm of soil
// - Before planting season
// - 5-10cm layer, mix thoroughly
// - Benefits root zone directly

// ### As Mulch:
// - Spread on surface, don't mix
// - During growing season
// - 3-5cm layer around plants
// - Feeds soil from top down

// ### Which to Choose:
// - **New beds:** Amendment (establish soil life)
// - **Established gardens:** Mulch (maintain)
// - **Heavy feeders:** Both (tomatoes, squash)
// - **Perennials:** Mulch (don't disturb roots)

// *I amend beds before planting, then mulch with compost mid-season. Best of both worlds.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },

//     // ========== SEED SAVING (25 posts) ==========
//     {
//         title: "Saving Tomato Seeds - Complete Guide",
//         content: `## Preserve Your Best Varieties Forever

// Tomato seeds are easy to save and stay viable for 5+ years.

// ### Selection:
// Choose the **best fruits** from the **best plants**. Not just big - consider disease resistance, taste, productivity.

// ### Fermentation Method:
// 1. Scoop seeds with gel into jar
// 2. Add equal amount of water
// 3. Cover with cloth (not lid - needs air)
// 4. Stir daily for 3-5 days
// 5. Mold forms - this is good! Breaks down germination inhibitors
// 6. Rinse clean, dry on plate

// ### Drying:
// - Spread on ceramic plate (not paper - sticks)
// - Stir daily
// - Dry for 1-2 weeks until brittle

// ### Storage:
// - Paper envelope, labeled with variety and date
// - Cool, dark, dry location
// - Add silica gel packet if humid

// *I haven't bought tomato seeds in 8 years. My grandmother's variety still going strong.*`,
//         category: "seed-saving",
//         journeyStage: "harvest",
//         isVerified: true,
//         isPinned: true,
//     },
//     {
//         title: "Understanding Open-Pollinated vs Hybrid",
//         content: `## Know What You Can and Cannot Save

// This knowledge is essential for seed saving.

// ### Open-Pollinated (OP) / Heirloom:
// - Seeds produce plants like the parent
// - Can be saved year after year
// - Often have "OP" or "heirloom" on packet
// - Varieties developed before 1950 are usually OP

// ### Hybrid (F1):
// - Seeds produce unpredictable plants
// - Must buy new seeds each year
// - Usually labeled "F1" or "hybrid"
// - Often bred for shipping, not taste

// ### Why This Matters:
// - Saving hybrid seeds = wasted effort, disappointing plants
// - OP varieties = **food sovereignty**
// - Local OP varieties = adapted to our conditions

// *Only grow OP varieties now. Built a collection of 40+ varieties that thrive here.*`,
//         category: "seed-saving",
//         journeyStage: "seed",
//         isVerified: true,
//     },
//     {
//         title: "Saving Pepper Seeds Simply",
//         content: `## Easier Than Tomatoes!

// Peppers are perfect for beginner seed savers.

// ### When to Harvest:
// Wait until pepper is **fully ripe** (color stops changing). Seeds from green peppers won't be mature.

// ### Process:
// 1. Cut pepper, scoop out seeds
// 2. Separate seeds from membrane
// 3. No fermentation needed!
// 4. Spread to dry 2 weeks
// 5. Store in paper envelope

// ### Isolation:
// Sweet peppers can cross with hot peppers! Either:
// - Grow only one variety
// - Separate by 200+ meters
// - Cover flowers with bags

// ### Special for Hot Peppers:
// Wear gloves! Capsaicin on hands + touching eyes = bad day.

// *My collection includes 12 pepper varieties adapted to Gaza climate. All started from one special plant.*`,
//         category: "seed-saving",
//         journeyStage: "harvest",
//     },
//     {
//         title: "Saving Squash and Melon Seeds",
//         content: `## Big Seeds, Easy Saving

// Cucurbit family (squash, melon, cucumber, watermelon) are easy to save.

// ### Key Rule:
// Different varieties of same species CROSS easily! 
// - All summer squash (zucchini, yellow) = same species
// - All winter squash (butternut, pumpkin) = mixed species (check)
// - Watermelon = own species (safe to grow together)

// ### Process:
// 1. Let fruit fully mature (past eating stage)
// 2. Scoop seeds, rinse off pulp
// 3. Dry completely (2-3 weeks)
// 4. Test: Seed should snap, not bend

// ### Storage Life:
// - Fresh seeds: Nearly 100% germination
// - 5 years: Still 80%+
// - 10 years: Some still viable

// *My Jaffa watermelon came from seeds my uncle saved in 1965. Still the sweetest variety.*`,
//         category: "seed-saving",
//         journeyStage: "harvest",
//     },
//     {
//         title: "Creating a Seed Library Community",
//         content: `## Share Seeds, Build Food Security

// Individual seed saving is good. Community seed libraries are transformative.

// ### How It Works:
// - Members deposit seeds
// - Members can borrow seeds
// - Borrow 10, return 20
// - Varieties multiply and spread

// ### Starting a Library:
// 1. Find 5-10 committed gardeners
// 2. Each contributes 3-5 varieties
// 3. Create simple catalog
// 4. Meet quarterly to exchange

// ### Organization:
// - Store in central cool location
// - Use labeled envelopes
// - Track what goes in/out
// - Annual viability testing

// *Our neighborhood library has 80+ varieties now. Started 4 years ago with 20. Complete food security begins here.*`,
//         category: "seed-saving",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Saving Beans and Peas",
//         content: `## Easiest Seeds to Start With

// If you're new to seed saving, start here.

// ### Why Beans/Peas Are Perfect:
// - Self-pollinating (no crossing)
// - Obvious when mature
// - Large seeds, easy handling
// - Long storage life

// ### Harvest Timing:
// - Leave pods on plant until completely dry
// - Pods should be brown and brittle
// - Seeds rattle inside

// ### Processing:
// 1. Pick dry pods
// 2. Shell by hand or gentle stomping
// 3. Winnow to remove chaff
// 4. Check for insect damage
// 5. Store in airtight container

// ### Pest Prevention:
// Freeze for 48 hours before storage (kills hidden eggs).

// *Started with one grandmother's fava bean variety. Now grow enough to save pounds every year.*`,
//         category: "seed-saving",
//         journeyStage: "harvest",
//     },
//     {
//         title: "Saving Seeds from Biennial Crops",
//         content: `## Carrots, Beets, Onions Need Two Years

// These crops produce seeds in their second year. Plan ahead!

// ### The Cycle:
// - **Year 1:** Grow plant, select best, leave in ground or store
// - **Winter:** Overwintering in ground (our mild winters allow this)
// - **Year 2:** Plant flowers, produces seeds

// ### Specific Tips:
// - **Carrots:** Will cross with wild carrot. Pull any nearby.
// - **Onions:** Need 12+ plants to avoid inbreeding
// - **Beets/Chard:** These cross! Grow only one.

// ### Seed Collection:
// - Wait until seed heads dry on plant
// - Cut, hang upside down in paper bag
// - Seeds fall as they dry
// - Clean and store

// *Worth the two-year wait. Store-bought carrot seeds don't produce carrots like my grandmother's.*`,
//         category: "seed-saving",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Proper Seed Storage for Longevity",
//         content: `## Keep Seeds Alive for Years

// Poor storage = dead seeds = wasted effort.

// ### The Rules:
// - **Dry:** Below 8% moisture content
// - **Cool:** Every 5°C cooler doubles lifespan
// - **Dark:** Light degrades viability
// - **Airtight:** Once fully dry

// ### Storage Containers:
// - Glass jars with tight lids (best)
// - Sealed plastic bags (good)
// - Paper envelopes (short term only)

// ### Adding Desiccant:
// - Silica gel packets (save from products)
// - Powdered milk in tissue
// - Dry rice in cloth bag

// ### Storage Locations:
// - Refrigerator (ideal)
// - Cool dark closet (good)
// - Not freezer unless properly dried (ice crystals kill)

// *My seed collection lives in the fridge. Some varieties over 15 years old still germinate.*`,
//         category: "seed-saving",
//         journeyStage: "seed",
//         isVerified: true,
//     },
//     {
//         title: "Testing Seed Viability Before Planting",
//         content: `## Don't Waste Garden Space on Dead Seeds

// Simple test tells you germination rate before planting.

// ### Method:
// 1. Count out 10 seeds
// 2. Place on damp paper towel
// 3. Roll up, place in plastic bag (not sealed)
// 4. Keep warm (20-25°C)
// 5. Check daily, keep moist
// 6. Count germinated after 7-14 days

// ### Reading Results:
// - 10/10 = Excellent, plant normal rate
// - 7-9/10 = Good, plant slightly more
// - 4-6/10 = Fair, plant double
// - Below 4/10 = Probably not worth planting

// ### When to Test:
// - All saved seeds before planting season
// - Any seeds over 2 years old
// - Seeds stored in unknown conditions

// *This 10-minute test has saved me from many failed plantings.*`,
//         category: "seed-saving",
//         journeyStage: "seed",
//     },
//     {
//         title: "Roguing - Selecting the Best Plants",
//         content: `## Improve Your Variety Year After Year

// Roguing means removing inferior plants before they set seed.

// ### What to Rogue (Remove):
// - First to bolt (lettuce, cilantro)
// - Weak or stunted plants
// - Disease-showing plants
// - Off-type (wrong color, shape)
// - Smallest or least productive

// ### What to Save Seed From:
// - Last to bolt
// - Strongest, most productive
// - Most disease-resistant
// - Best tasting
// - Most true to type

// ### The Math:
// If you grow 100 plants and save seed from only the best 20, you're selecting for improvement each year.

// *My tomato line after 6 years of selection outproduces the original by 40%. Same variety, better performance.*`,
//         category: "seed-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Saving Lettuce and Leafy Green Seeds",
//         content: `## Let Them Bolt!

// Usually we prevent bolting. For seeds, we encourage it.

// ### Process:
// 1. Choose best plants
// 2. Let them flower (tall stalk forms)
// 3. Yellow flowers → white fluffy seeds
// 4. Harvest when 50% have fluff
// 5. Dry further indoors
// 6. Rub heads to release seeds

// ### Challenges:
// - Seeds shatter easily (harvest before wind)
// - Lettuce types cross (separate by 50m)
// - Small seeds - need fine strainer to clean

// ### Storage:
// Lettuce seed: 3-5 years
// Other greens vary (arugula 4 years, spinach 3 years)

// *One lettuce plant produces thousands of seeds. Let two bolt and you'll never buy lettuce seed again.*`,
//         category: "seed-saving",
//         journeyStage: "harvest",
//     },
//     {
//         title: "Isolation Distances for Seed Purity",
//         content: `## How Far to Prevent Crossing

// Cross-pollination produces off-type seeds. Prevention depends on crop.

// ### Self-Pollinators (Easy):
// - Tomatoes: Can grow side by side
// - Peppers: 50m ideal, less ok
// - Beans/Peas: Touch each other, no problem
// - Lettuce: 50m

// ### Insect-Pollinated (Harder):
// - Squash: 500m+ (or hand pollinate)
// - Cucumbers: 500m
// - Melons: 500m
// - Corn: 1km+ (wind pollinated)

// ### Solutions for Small Gardens:
// - Grow only one variety per species
// - Stagger planting (flower at different times)
// - Hand pollination with barriers
// - Trade with distant neighbors

// *I coordinate with three other gardeners. Each grows different squash varieties, we trade seeds.*`,
//         category: "seed-saving",
//         journeyStage: "seed",
//     },
//     {
//         title: "Hand Pollination for Pure Seeds",
//         content: `## Control Genetics Completely

// When you can't isolate by distance, pollinate by hand.

// ### Squash Method:
// 1. Find male flower (thin stem) and female (baby fruit behind)
// 2. **Evening before:** Tape both closed
// 3. **Morning:** Pick male, remove petals
// 4. Open female, brush pollen on stigma
// 5. Re-tape female
// 6. Mark with string (know which fruit has pure seed)

// ### Corn Method:
// - Bag tassel before it sheds pollen
// - Bag ear before silk appears
// - When silk emerges, shake tassel pollen into bag
// - Apply to silk, re-bag
// - Mark with stake

// **Worth the effort** when you have special varieties.`,
//         category: "seed-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Saving Herb Seeds",
//         content: `## Annual and Perennial Herb Seeds

// Most herbs are easy to save.

// ### Annual Herbs:
// - **Cilantro/Coriander:** Let flower, collect dry brown seeds
// - **Dill:** Same as cilantro
// - **Basil:** Let flowers dry on plant, strip seeds
// - **Parsley (biennial):** Wait for second year

// ### Perennial Herbs:
// Usually propagate by division/cuttings, but can save seed:
// - **Oregano:** Tiny seeds, shake flower heads into bag
// - **Thyme:** Same as oregano
// - **Sage:** Let flowers dry, collect

// ### Special Case - Mint:
// Don't bother with seeds. Cuttings root in water in a week.

// *My cilantro reseeds itself now. One planting years ago, endless harvest.*`,
//         category: "seed-saving",
//         journeyStage: "harvest",
//     },
//     {
//         title: "Documenting Your Seed Collection",
//         content: `## Records Make Your Collection Valuable

// Without records, seeds are just random packets.

// ### What to Record:
// - Variety name and origin story
// - Date saved
// - Growing notes (when planted, harvested)
// - Performance notes (disease, productivity)
// - Parent selection criteria

// ### Format:
// - Simple notebook works
// - Spreadsheet for larger collections
// - Photos of plants and produce

// ### Label System:
// - Variety name
// - Year saved
// - Your code (if you have many)

// ### Why It Matters:
// - Track viability over years
// - Share meaningful information with others
// - Remember what works
// - Build on successes

// *My seed journal goes back 10 years. It's more valuable than the seeds themselves.*`,
//         category: "seed-saving",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Wet Seeds vs Dry Seeds Processing",
//         content: `## Two Categories, Two Methods

// Seeds fall into two processing types.

// ### Wet Seeds (From Fleshy Fruits):
// - Tomatoes
// - Cucumbers
// - Melons
// - Squash

// **Method:** Scoop out, possibly ferment, rinse, dry

// ### Dry Seeds (From Pods/Heads):
// - Beans, peas
// - Lettuce, greens
// - Peppers (dry when ripe)
// - Herbs

// **Method:** Let dry on plant, thresh, winnow

// ### Key Difference:
// Wet seeds have germination inhibitors that must be removed (fermentation or washing). Dry seeds are ready once dried.

// *Knowing this distinction saved me from ruining my first tomato seeds (I dried them without fermenting - they rotted).*`,
//         category: "seed-saving",
//         journeyStage: "harvest",
//     },

//     // ========== CROP ROTATION (15 posts) ==========
//     {
//         title: "Basic 4-Year Rotation Plan",
//         content: `## Break Disease Cycles, Build Soil

// Rotation prevents pest buildup and balances soil nutrients.

// ### The Four Groups:
// 1. **Legumes** (beans, peas) - Fix nitrogen
// 2. **Brassicas** (cabbage, cauliflower) - Heavy feeders
// 3. **Alliums/Roots** (onion, carrot) - Light feeders
// 4. **Fruits** (tomato, pepper, squash) - Heavy feeders

// ### Rotation Order:
// Legumes → Brassicas → Fruits → Roots → back to Legumes

// ### Why This Order:
// - Legumes add nitrogen
// - Brassicas use that nitrogen
// - Fruits use remaining fertility
// - Roots grow on low fertility
// - Legumes restore nitrogen

// *After implementing this rotation, my tomato blight problems disappeared. Soil-borne diseases can't find hosts.*`,
//         category: "crop-rotation",
//         journeyStage: "seed",
//         isVerified: true,
//         isPinned: true,
//     },
//     {
//         title: "Small Garden Rotation Strategy",
//         content: `## Yes, You Can Rotate Even in 20 Square Meters

// Limited space doesn't mean no rotation.

// ### Divide and Conquer:
// - Split garden into 4 sections
// - Each section follows the rotation
// - Even if sections are tiny

// ### Or Use Time:
// - Spring crop: Group 1
// - Summer crop: Group 2
// - Fall crop: Group 3
// - Cover crop winter

// ### Container Gardens:
// - Rotate between pot positions
// - Change soil partially each year
// - Don't plant same thing in same pot

// ### Minimum Rotation:
// Never plant same family in same spot two years in a row. Even this simple rule helps.

// *My balcony garden uses pot rotation. 15 pots, rotate between 3 positions. Works!*`,
//         category: "crop-rotation",
//         journeyStage: "seed",
//     },
//     {
//         title: "Why Nightshades Must Rotate",
//         content: `## Tomatoes, Peppers, Eggplant, Potato Dangers

// The Solanaceae family is vulnerable to devastating diseases.

// ### Shared Diseases:
// - Early and late blight
// - Fusarium wilt
// - Verticillium wilt
// - Root-knot nematodes

// ### These Diseases:
// - Live in soil for years
// - Spread between family members
// - Build up with repeated planting
// - Eventually make land unusable

// ### Minimum Rotation:
// - 3 years between nightshades in same spot
// - 4-5 years is better
// - Never follow potato with tomato (or vice versa)

// ### If You've Already Had Disease:
// - Remove all plant debris
// - Solarize soil in summer
// - Plant resistant varieties
// - Use rotation going forward

// *Lost entire tomato crop to blight from infected soil. Now I'm strict about rotation.*`,
//         category: "crop-rotation",
//         journeyStage: "seed",
//     },
//     {
//         title: "Cover Crops in Rotation",
//         content: `## Fallow Period That Builds Soil

// Between cash crops, grow soil-builders.

// ### Best Cover Crops for Gaza:
// - **Winter:** Fava beans, vetch, clover
// - **Summer:** Cowpeas, sorghum-sudan grass

// ### Benefits:
// - Add organic matter
// - Fix nitrogen (legumes)
// - Break pest cycles
// - Prevent erosion
// - Suppress weeds

// ### How to Use:
// 1. After harvest, plant cover crop
// 2. Let grow until flowering
// 3. Chop and incorporate (don't remove)
// 4. Wait 2-3 weeks before planting next crop

// *Every bed gets cover crop every 3rd year. My soil improves continuously even as I harvest.*`,
//         category: "crop-rotation",
//         journeyStage: "growing",
//     },
//     {
//         title: "Rotation for Pest Control",
//         content: `## Starve the Pests Out

// Many pests specialize on one crop family. Move their food, lose them.

// ### Example Pests and Rotation:
// - **Tomato hornworm:** Only eats nightshades, rotate them
// - **Cabbage worms:** Only eat brassicas, rotate them
// - **Onion maggot:** Only attacks alliums, rotate them

// ### How Long to Rotate:
// - Flying insects: 50m distance often enough
// - Soil-dwelling: 3-4 years minimum
// - Nematodes: 5+ years for full control

// ### Trap Cropping:
// Plant small amount of pest's favorite as sacrifice, concentrate pests there, destroy.

// *After rotation plus trap cropping, I've reduced my pest damage by 80%. No pesticides needed.*`,
//         category: "crop-rotation",
//         journeyStage: "growing",
//     },
//     {
//         title: "Nutrient Dynamics in Rotation",
//         content: `## Heavy Feeders Follow Light Feeders

// Different crops take different amounts from soil.

// ### Heavy Feeders (High Nitrogen):
// - Tomatoes
// - Corn
// - Squash
// - Cabbage family
// - Leafy greens

// ### Light Feeders:
// - Root vegetables
// - Herbs
// - Onion family
// - Beans (they add nitrogen!)

// ### Rotation Logic:
// 1. Add compost
// 2. Plant heavy feeder
// 3. Next year: Medium feeder (peppers, beans)
// 4. Next year: Light feeder (roots, onions)
// 5. Add compost again
// 6. Repeat

// *By matching fertility to crop needs, I use less compost and get better results.*`,
//         category: "crop-rotation",
//         journeyStage: "seed",
//     },

//     // ========== ORGANIC METHODS (20 posts) ==========
//     {
//         title: "Making Neem Oil Spray at Home",
//         content: `## Natural Pest Control That Works

// Neem is safe for humans, deadly for many pests.

// ### Basic Recipe:
// - 1 tablespoon neem oil
// - 1 teaspoon liquid soap (emulsifier)
// - 1 liter warm water
// - Mix thoroughly

// ### What It Controls:
// - Aphids
// - Whiteflies
// - Spider mites
// - Thrips
// - Some caterpillars

// ### How It Works:
// Disrupts insect hormones, stops feeding and reproduction. Doesn't kill instantly but pests die within days.

// ### Application:
// - Spray in evening (sunlight degrades neem)
// - Cover all surfaces, especially undersides
// - Repeat weekly until pests gone

// **Caution:** Even organic sprays can harm beneficial insects. Use only when needed.`,
//         category: "organic",
//         journeyStage: "growing",
//         isVerified: true,
//     },
//     {
//         title: "Garlic Spray for Pest Prevention",
//         content: `## Strong Smell, Strong Protection

// Garlic doesn't kill pests but repels many.

// ### Recipe:
// 1. Blend 2 whole garlic heads with 1 liter water
// 2. Let sit overnight
// 3. Strain through cloth
// 4. Add 1 teaspoon soap
// 5. Dilute 1:10 before spraying

// ### Best For:
// - Prevention (spray before pests arrive)
// - Repelling aphids and whiteflies
// - Deterring some larger pests

// ### Limitations:
// - Smell fades, must reapply after rain
// - Won't eliminate established infestations
// - Strong smell on harvest (wait 2 weeks before eating)

// *I spray every 2 weeks as prevention. Problems never get started.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },
//     {
//         title: "Beneficial Insects - Inviting Helpers",
//         content: `## Let Nature Control Pests

// Instead of killing all insects, attract ones that eat pests.

// ### Top Beneficial Insects:
// - **Ladybugs:** Eat 50+ aphids per day
// - **Lacewings:** Larvae devour many pests
// - **Parasitic wasps:** Lay eggs in caterpillars
// - **Ground beetles:** Eat soil pests at night

// ### Attracting Them:
// - Plant flowers! (Dill, fennel, yarrow, alyssum)
// - Provide water source
// - Leave some wild areas
// - Don't use pesticides (kills beneficials too)

// ### Patience Required:
// Beneficials take time to establish. First season you might see more pests, then balance comes.

// *Took 2 years, but now my garden manages itself. Ladybugs everywhere, aphids rare.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },
//     {
//         title: "DIY Organic Fertilizers",
//         content: `## Free Plant Food from Waste

// Commercial fertilizers cost money and may not be available. Make your own.

// ### Banana Peel Tea:
// Soak peels in water 3 days. High potassium for flowers/fruit.

// ### Eggshell Calcium:
// Dry, crush to powder. Prevents blossom end rot.

// ### Coffee Grounds:
// Add directly to soil. Nitrogen + attracts worms.

// ### Fish Waste Tea:
// Soak fish scraps in covered bucket (outside - smells!) 2 weeks. Dilute 1:10. Complete fertilizer.

// ### Comfrey Tea:
// If you grow comfrey: fill bucket with leaves, add water, steep 3 weeks. Dilute 1:10. High potassium.

// *Using these plus compost, I've grown vegetables for 8 years with zero purchased fertilizer.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },
//     {
//         title: "Physical Barriers for Pest Control",
//         content: `## Block Pests Without Chemicals

// Sometimes the best control is prevention.

// ### Row Covers:
// Lightweight fabric over plants. Keeps flying insects out while letting water/light through.

// ### Cutworm Collars:
// Cardboard tubes around seedling stems. Prevents cutworm damage. Toilet rolls work perfectly.

// ### Tree Bands:
// Sticky band around trunk catches crawling pests moving up.

// ### Copper Tape:
// Around pot rims or bed edges. Slugs and snails won't cross (gives slight shock).

// ### Physical Removal:
// Hand-picking caterpillars. Spraying aphids with water jet. Simple but effective.

// *Row covers saved my brassicas from complete destruction by butterflies.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },
//     {
//         title: "Companion Planting for Pest Control",
//         content: `## Plants That Protect Each Other

// Strategic combinations reduce pest problems.

// ### Classic Combinations:
// - **Tomatoes + Basil:** Basil may repel tomato hornworm
// - **Carrots + Onions:** Each repels the other's fly
// - **Cabbage + Dill:** Attracts wasps that parasitize cabbage worms
// - **Beans + Marigold:** Marigold repels bean beetles

// ### Border Plants:
// Ring your garden with:
// - Marigolds (most pests dislike)
// - Garlic/Onions (strong smell deters)
// - Herbs (confuse pests looking for crops)

// ### Scientific Caveat:
// Not all companion planting is proven. But I've observed clear benefits with some combinations.

// *Tomato-basil works for me. Best tomatoes and never see hornworms anymore.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },
//     {
//         title: "Dealing with Aphids Organically",
//         content: `## Most Common Pest, Many Solutions

// Every gardener fights aphids. Here's the complete guide.

// ### Physical Controls:
// - Strong water spray knocks them off (repeat daily)
// - Wipe off with fingers (squish or drop in soapy water)

// ### Homemade Sprays:
// - Soap spray (1 tsp dish soap per liter)
// - Neem oil
// - Garlic spray
// - Hot pepper spray

// ### Biological Controls:
// - Ladybugs (each eats 50+ aphids daily)
// - Lacewing larvae
// - Parasitic wasps

// ### Prevention:
// - Avoid excess nitrogen (makes leaves soft and attractive)
// - Healthy plants resist better
// - Check undersides of leaves early

// *Combination of soap spray + inviting ladybugs = aphid problems solved.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },
//     {
//         title: "Organic Weed Control Methods",
//         content: `## No Herbicides Needed

// Weeds compete for water and nutrients. Control them organically.

// ### Prevention (Best Approach):
// - Thick mulch (10cm blocks most weeds)
// - Cover crops smother weeds
// - Dense planting leaves no space

// ### Manual Removal:
// - Pull when small (before roots establish)
// - Hoe on sunny days (weeds dry out)
// - Cut just below soil surface

// ### Solarization:
// Clear plastic on soil for 4-6 weeks in summer. Kills weed seeds in top 10cm.

// ### Boiling Water:
// Pour on unwanted plants. Kills immediately. Good for cracks in pavement.

// ### Vinegar:
// Concentrated (not kitchen) vinegar burns plants. Careful - kills everything.

// *I mulch heavily and pull weeds for 10 minutes each morning. Garden stays clean.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },
//     {
//         title: "Building Healthy Soil for Disease Resistance",
//         content: `## Prevention Is Better Than Cure

// Healthy soil grows healthy plants that resist disease.

// ### Soil Health Indicators:
// - Dark color (organic matter)
// - Crumbly texture
// - Earthworms present
// - Good drainage but holds moisture
// - Pleasant earthy smell

// ### Building Healthy Soil:
// - Add compost every season
// - Never leave soil bare
// - Minimize tilling
// - Rotate crops
// - Feed soil life, not just plants

// ### Why It Works:
// Healthy soil contains billions of beneficial organisms that:
// - Compete with disease organisms
// - Produce antibiotics naturally
// - Form protective relationships with roots

// *After 5 years of soil building, I rarely see diseases that devastated my crops before.*`,
//         category: "organic",
//         journeyStage: "full-cycle",
//         isVerified: true,
//     },
//     {
//         title: "Making Compost Tea for Foliar Feeding",
//         content: `## Spray Food and Disease Protection

// Compost tea applied to leaves provides nutrition and beneficial microbes.

// ### How to Make:
// 1. Hang finished compost in burlap sack in water
// 2. Bubble air through (aquarium pump) for 24-48 hours
// 3. Remove sack, use immediately

// ### Why Aerate?
// Oxygen grows beneficial aerobic organisms. They compete with disease organisms on leaf surface.

// ### Application:
// - Strain through cloth (prevents sprayer clog)
// - Spray early morning or evening
// - Cover all leaf surfaces
// - Apply weekly during growing season

// ### Results:
// - Reduced fungal diseases
// - Healthier leaves
// - Better overall plant vigor

// *Since using aerated compost tea, my fungal disease problems reduced by 70%.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },

//     // ========== ZERO WASTE (15 posts) ==========
//     {
//         title: "Zero Waste Kitchen to Garden",
//         content: `## Every Scrap Has a Purpose

// Nothing from the kitchen needs to go to waste.

// ### Direct Garden Use:
// - Eggshells → Crush for calcium
// - Coffee grounds → Nitrogen, worm food
// - Tea leaves → Mulch for acid-lovers
// - Banana peels → Potassium tea or compost
// - Pasta water → Nutrients for plants

// ### Compost:
// - All vegetable scraps
// - Fruit waste
// - Paper towels
// - Cardboard
// - Natural fiber scraps

// ### Animal Feed:
// - Vegetable ends → Chickens
// - Overripe fruit → Chickens
// - Bread → Chickens (limited)

// *Our family of 5 produces less than one small bag of actual trash per week now.*`,
//         category: "zero-waste",
//         journeyStage: "compost",
//     },
//     {
//         title: "Repurposing Containers for the Garden",
//         content: `## Free Pots, Trays, and Tools

// Stop buying plastic garden supplies.

// ### Containers:
// - Yogurt cups → Seed starting
// - Large tins → Herb pots
// - Buckets → Deep root plants
// - Bottles → Drip irrigation
// - Plastic bags → Soil storage

// ### Trays:
// - Styrofoam boxes → Seed trays
// - Baking trays → Bottom watering
// - Plastic lids → Saucers

// ### Tools:
// - Milk jugs → Scoops, cloches
// - Old knives → Weeding tools
// - Sticks → Plant markers
// - Pantyhose → Soft plant ties

// *Haven't bought garden supplies in years. Everything I need comes from "trash".*`,
//         category: "zero-waste",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Growing Food from Scraps",
//         content: `## Free Food from Kitchen Ends

// Some vegetables regrow from parts you'd normally throw away.

// ### Regrowing in Water:
// - **Green onions:** Place roots in water. Endless harvest.
// - **Celery:** Base in water, roots appear, plant out.
// - **Lettuce:** Same as celery.
// - **Leeks:** Same as green onions.

// ### Regrowing in Soil:
// - **Garlic:** Plant any clove.
// - **Potato:** Pieces with eyes grow new potatoes.
// - **Ginger:** Knobs sprout if planted.
// - **Sweet potato:** Slips from suspended potato.

// ### Success Tips:
// - Use organic produce (non-organic may be treated)
// - Change water frequently (prevent rot)
// - Be patient (some take weeks to show growth)

// *My kitchen windowsill is a permanent nursery. Free food constantly.*`,
//         category: "zero-waste",
//         journeyStage: "seed",
//     },
//     {
//         title: "Reducing Water Waste in Gardens",
//         content: `## Every Drop Counts Twice

// Waste nothing, not even water.

// ### Capture Waste Water:
// - Cooking water (nutrients included)
// - Washing vegetable water
// - Dehumidifier/AC water
// - Waiting-for-hot-shower water

// ### Reduce Need:
// - Mulch heavily
// - Water deeply but less often
// - Use drip or targeted watering
// - Time watering correctly

// ### Recirculate:
// - Wicking beds reuse water
// - Closed aquaponic systems
// - Pot saucers return drainage

// ### Track Usage:
// If you measure, you manage better. Note how much you use, aim to reduce.

// *Reduced my garden water use by 60% through these methods. Same production.*`,
//         category: "zero-waste",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Preserving the Harvest - Zero Waste",
//         content: `## Nothing Rots, Nothing Wastes

// When harvest exceeds fresh eating, preserve everything.

// ### Drying:
// - Tomatoes, peppers, herbs dry easily in our sun
// - Onions and garlic store dry for months
// - Beans dry on vine, store all year

// ### Pickling:
// - Cucumbers, peppers, cauliflower
// - Traditional olive preservation
// - Vinegar or salt brines

// ### Fermenting:
// - Cabbage → sauerkraut
// - Various vegetables → mixed pickles

// ### Freezing:
// - Blanched vegetables
// - Tomato sauce
// - Prepared pestos

// ### Sharing:
// What you can't preserve, share. Nothing goes to waste in community.

// *Last summer's tomato glut became winter's sauce. Nothing lost.*`,
//         category: "zero-waste",
//         journeyStage: "harvest",
//     },

//     // ========== GENERAL (20 posts) ==========
//     {
//         title: "Starting Your First Garden in Gaza",
//         content: `## Everything a Beginner Needs to Know

// Starting is easier than you think.

// ### Location Selection:
// - **Sun:** 6+ hours of direct sun for vegetables
// - **Water access:** Near enough to reach with hose/bucket
// - **Protection:** Avoid exposed windy areas

// ### Start Small:
// Don't overwhelm yourself. A 2x2 meter bed is plenty for beginners.

// ### First Crops (Easy to Grow Here):
// - Tomatoes (plant in spring)
// - Peppers
// - Herbs (mint, basil, za'atar)
// - Lettuce (fall/winter)
// - Green onions (anytime)

// ### Essential Supplies:
// - Seeds or seedlings
// - Compost
// - Mulch material
// - Bucket for water
// - Basic hand tools

// **Start this season. Don't wait for perfect conditions.**`,
//         category: "general",
//         journeyStage: "seed",
//         isPinned: true,
//     },
//     {
//         title: "Gardening in Containers and Balconies",
//         content: `## No Land? No Problem

// Productive gardens grow in any space.

// ### Container Basics:
// - **Size matters:** Bigger is better. Minimum 30cm deep for vegetables.
// - **Drainage:** Holes in bottom essential
// - **Soil:** Potting mix, not garden soil

// ### Best Balcony Crops:
// - Herbs (small pots fine)
// - Tomatoes (large pots, with stake)
// - Peppers (medium pots)
// - Leafy greens (shallow containers)
// - Strawberries (hanging baskets)

// ### Challenges:
// - Dries faster than ground (water more often)
// - Limited nutrients (fertilize regularly)
// - Temperature extremes (move pots as needed)

// *My entire 2x3 meter balcony produces vegetables for 3 people. Possible for everyone.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Growing Food in Crisis Conditions",
//         content: `## Resilient Gardening When Times Are Hard

// Our community knows difficulty. Gardens provide security.

// ### Priorities When Resources Limited:
// 1. **Calorie crops first:** Potatoes, beans, squash
// 2. **Fast crops:** Leafy greens (harvest in 30 days)
// 3. **Continuous harvest:** Cut-and-come-again crops

// ### Minimal Input Methods:
// - Rainwater only when possible
// - Compost instead of fertilizer
// - Seed saving instead of buying
// - Physical pest control

// ### Community Resilience:
// - Share surplus
// - Trade seeds
// - Teach neighbors
// - Garden together

// *During hardest times, our small gardens kept families fed. Growing food is security.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Seasonal Planting Calendar for Gaza",
//         content: `## What to Plant When

// Our Mediterranean climate allows year-round growing.

// ### Spring (March-May):
// - Plant: Tomatoes, peppers, eggplant, squash, beans
// - Direct seed: Cucumber, melon, corn
// - Still growing: Cool season crops finishing

// ### Summer (June-August):
// - Maintain summer crops
// - Start fall seedlings in shade
// - Harvest and preserve

// ### Fall (September-November):
// - Plant: Lettuce, spinach, brassicas
// - Direct seed: Peas, fava beans
// - Last harvests of summer crops

// ### Winter (December-February):
// - Grow: Leafy greens, root vegetables
// - Plan: Next season
// - Prepare: Beds, compost

// *Following this calendar, I harvest something from the garden every single week of the year.*`,
//         category: "general",
//         journeyStage: "seed",
//         isVerified: true,
//     },
//     {
//         title: "Growing in Raised Beds",
//         content: `## Better Drainage, Better Control

// Raised beds solve many Gaza soil problems.

// ### Benefits:
// - Control soil quality completely
// - Better drainage for heavy rain
// - Less bending (easier on back)
// - Clear pathways
// - Easier to cover/protect

// ### Building Materials:
// - Concrete blocks (permanent)
// - Scrap wood (free, temporary)
// - Stone (traditional, beautiful)
// - Nothing (just mound soil)

// ### Dimensions:
// - Width: 1.2m max (reach from sides)
// - Length: Any
// - Height: 20-30cm minimum

// ### Filling:
// - Bottom: Branches, cardboard
// - Middle: Compost, aged manure
// - Top: Good soil/compost mix

// *All my vegetables grow in 4 raised beds. Total control of soil quality.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Understanding Soil Types",
//         content: `## Work With Your Soil, Not Against It

// Know your soil to garden better.

// ### Sandy Soil (Common in Coastal Gaza):
// - Drains fast
// - Needs more water
// - Loses nutrients quickly
// - **Improve:** Add organic matter, compost

// ### Clay Soil:
// - Drains slowly
// - Compacts when wet
// - Holds nutrients well
// - **Improve:** Add gypsum, organic matter

// ### Rocky Soil:
// - Difficult to dig
// - May drain well or pool
// - **Options:** Build raised beds on top

// ### Testing Your Soil:
// 1. Wet a handful
// 2. Squeeze into ball
// 3. Sandy = falls apart
// 4. Clay = stays in ball
// 5. Loam = holds together loosely

// *After years of adding compost, my sandy soil now holds moisture and nutrients.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Planning a Four-Season Garden",
//         content: `## Fresh Food All Year

// With planning, harvest never stops.

// ### The Strategy:
// - Cool season crops: October-April
// - Warm season crops: April-October
// - Overlap and succession plant

// ### Succession Planting:
// Plant same crop every 3-4 weeks for continuous harvest. Never have too much or too little.

// ### Perennials for Continuous Harvest:
// - Fruit trees (seasonal but annual)
// - Herbs (rosemary, thyme, sage)
// - Egyptian walking onions
// - Perpetual spinach

// ### Season Extension:
// - Plastic covers for cold nights
// - Shade cloth for hot days
// - Walls as heat sinks

// *January or July, I'm harvesting something. Planning made this possible.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Starting Seeds vs Buying Transplants",
//         content: `## Which Is Better?

// Both have their place. Know when to use each.

// ### Start From Seed When:
// - Growing rare/specific varieties
// - Need many plants (cheaper per plant)
// - Want strongest possible plants
// - Learning seed saving

// ### Buy Transplants When:
// - Just a few plants needed
// - Season running short
// - Don't have space for seedlings
// - Challenging crops (some brassicas)

// ### Starting Seeds Tips:
// - Use clean containers
// - Good drainage essential
// - Keep moist not wet
// - Warmth for germination
// - Light after sprouting

// **Cost Comparison:**
// One packet of tomato seeds: 10 shekels = 50 plants
// One tomato transplant: 5 shekels = 1 plant

// *I start most from seed, buy transplants only when behind schedule or trying something new.*`,
//         category: "general",
//         journeyStage: "seed",
//     },
//     {
//         title: "Natural Pest Predators to Encourage",
//         content: `## Let Nature Do the Work

// Beyond insects, many creatures eat pests.

// ### Birds:
// - Sparrows eat caterpillars
// - Wagtails hunt insects
// - Owls eat rodents (night)

// **Attract with:** Water, dense shrubs for shelter, not using pesticides

// ### Lizards:
// - Eat insects constantly
// - Love warm sunny spots
// - Hide under rocks and debris

// **Attract with:** Rock piles, undisturbed areas

// ### Spiders:
// - Constantly catching insects
// - Web-builders and hunters
// - Generally harmless to humans

// **Attract with:** Not disturbing webs, dense vegetation

// ### Frogs/Toads:
// - Incredible insect consumption
// - Active at night
// - Need water for breeding

// **Attract with:** Pond or wet area, shelter spots

// *My garden hosts all these. Combined they control more pests than any spray ever could.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Starting a Community Garden",
//         content: `## Growing Together, Sharing Bounty

// Community gardens strengthen neighborhoods.

// ### Finding Space:
// - Unused lots
// - School grounds
// - Mosque/church property
// - Rooftops

// ### Organizing:
// - Start small (5-10 families)
// - Clear rules from beginning
// - Shared vs individual plots
// - Tool sharing system
// - Water sharing plan

// ### Benefits Beyond Food:
// - Neighbors become friends
// - Skills shared between generations
// - Children learn growing
// - Mental health benefits
// - Food security for all

// ### Challenges to Expect:
// - Different commitment levels
// - Water/tool sharing disputes
// - Plot maintenance issues

// **Solution:** Clear agreements, regular meetings, patience.

// *Our 20-family community garden started 3 years ago. Transformed our neighborhood.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Dealing with Soil Salinity",
//         content: `## A Growing Problem, Manageable Solutions

// Many Gaza soils have high salt levels. Here's how to cope.

// ### Signs of Salt Damage:
// - White crust on soil surface
// - Burned leaf edges
// - Stunted growth
// - Plants wilt even when watered

// ### Management Strategies:
// 1. **Leaching:** Flood with fresh water, let drain
// 2. **Raised beds:** Start with clean soil above problem
// 3. **Organic matter:** Improves structure, buffers salt
// 4. **Drainage:** Salt can't build up if water flows through

// ### Salt-Tolerant Crops:
// - Beets and chard
// - Asparagus
// - Spinach
// - Some tomato varieties
// - Date palms

// ### Avoid:
// - Beans (very sensitive)
// - Lettuce (sensitive)
// - Carrots (moderately sensitive)

// *Years of adding compost dramatically improved my salty soil. Patience and organic matter.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Dealing with Sandy Soil",
//         content: `## Turn Beach Into Garden

// Much of Gaza has sandy soil. It can be transformed.

// ### Sandy Soil Challenges:
// - Water drains too fast
// - Nutrients wash away
// - Doesn't hold structure
// - Heats up quickly

// ### Solutions:
// 1. **Organic matter:** Compost, compost, compost
// 2. **Clay addition:** Mix in some clay if available
// 3. **Biochar:** Holds water and nutrients
// 4. **Mulch:** Reduces evaporation
// 5. **Frequent small fertilizing:** Since nutrients wash out

// ### Best Crops for Sandy Soil:
// - Root vegetables (easy to grow in loose soil)
// - Melons
// - Peanuts
// - Carrots
// - Sweet potatoes

// *After 5 years of heavy composting, my sand-based garden now holds moisture all day.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Why Grow Your Own Food?",
//         content: `## More Reasons Than You Think

// The benefits extend far beyond saving money.

// ### Food Quality:
// - Harvested ripe (not shipped green)
// - No unknown chemicals
// - Varieties chosen for taste not shipping
// - Freshness impossible to buy

// ### Health:
// - Gardening is exercise
// - Outdoor activity
// - Reduces stress
// - Connection to seasons

// ### Economics:
// - Seeds cost pennies, produce worth pounds
// - Buffer against price spikes
// - Preservable for off-season

// ### Security:
// - Less dependent on supply chains
// - Skills for uncertain times
// - Shareable abundance

// ### Community:
// - Shared over fences
// - Knowledge exchange
// - Reason to connect

// *Growing food changed my life far beyond what ends up on the plate.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Gardens as Mental Health Support",
//         content: `## Healing That Grows

// In difficult times, gardens heal more than bodies.

// ### Therapeutic Benefits:
// - Purpose and routine
// - Watching growth brings hope
// - Physical activity releases tension
// - Connection to life cycles
// - Beauty in difficult environments

// ### For Children:
// - Understanding where food comes from
// - Patience and nurturing skills
// - Safe outdoor activity
// - Pride in accomplishment

// ### For Trauma Recovery:
// - Grounding in present moment
// - Creating rather than just surviving
// - Agency and control
// - Future-oriented activity

// *The garden became my refuge during the hardest times. Caring for plants when nothing else made sense.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Teaching Children to Garden",
//         content: `## Growing the Next Generation of Growers

// Children are natural gardeners with guidance.

// ### Start With:
// - Fast crops (radishes in 30 days!)
// - Big seeds (beans, sunflowers)
// - Their own small space
// - Fun tasks (watering, harvesting)

// ### Let Them Choose:
// What child doesn't want to grow sunflowers or pumpkins? Let enthusiasm lead.

// ### Skills Learned:
// - Where food comes from
// - Patience
// - Cause and effect
// - Responsibility
// - Science (observation, hypothesis)

// ### Tips:
// - Keep tasks short
// - Celebrate every success
// - Let some things fail (learning!)
// - Make it play, not work
// - Eat what they grow

// *My children started at age 3. Now at 10 and 12, they manage their own plots. Life skills for generations.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Quick Fixes When Garden Is Failing",
//         content: `## Emergency Interventions

// When plants look sick, act fast.

// ### Yellow Leaves (Lower):
// - Usually nitrogen deficiency
// - **Fix:** Compost tea, urine diluted 1:10

// ### Yellow Leaves (Upper/Overall):
// - Often iron deficiency
// - **Fix:** Add compost, check pH, iron supplement

// ### Wilting Despite Moist Soil:
// - Root damage or disease
// - **Fix:** Check for root rot, reduce watering

// ### Burned Leaf Edges:
// - Salt damage or over-fertilizing
// - **Fix:** Flush with clear water, reduce fertilizer

// ### No Flowers/Fruit:
// - Too much nitrogen or not enough sun
// - **Fix:** Stop nitrogen fertilizer, prune for light

// ### Holes in Leaves:
// - Insects eating
// - **Fix:** Identify pest, apply appropriate organic control

// *Quick diagnosis and action has saved many of my plants from death.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "The Seed to Seed Philosophy",
//         content: `## Complete the Circle

// True sustainability means closing the loop.

// ### What Seed to Seed Means:
// - Start from saved seed
// - Grow the crop
// - Harvest for eating
// - Save seeds from best
// - Compost all waste
// - Use compost for next crop
// - No inputs from outside

// ### Benefits:
// - Total food independence
// - Varieties adapt to your conditions
// - No ongoing seed costs
// - Skills that last forever
// - Resilience against any disruption

// ### How to Start:
// 1. Begin saving seed from one easy crop
// 2. Add compost making
// 3. Gradually expand self-sufficiency
// 4. Share with neighbors to build community seed base

// *Five years ago I bought all seeds. Now I'm seed sovereign for 30+ varieties. Complete independence.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//         isVerified: true,
//     },
//     {
//         title: "Simple Tools Every Gardener Needs",
//         content: `## You Don't Need Much

// Expensive tools aren't necessary. Here's what actually matters.

// ### Essential:
// - **Digging tool:** Spade or sturdy fork
// - **Hand trowel:** For close work
// - **Watering can or hose:** Obvious
// - **Bucket:** A thousand uses

// ### Very Helpful:
// - Wheelbarrow or cart
// - Pruning shears
// - Rake
// - String for trellises

// ### Nice to Have:
// - Hoe for weeding
// - Soil thermometer
// - Watering timer
// - Harvest basket

// ### DIY Tools:
// - Dibber: Stick with marks for depth
// - Seed tape: Seeds on toilet paper
// - Row covers: Old bed sheets
// - Stakes: Any straight sticks

// *My best gardens were grown with just 4 tools: spade, trowel, bucket, and my hands.*`,
//         category: "general",
//         journeyStage: "seed",
//     },
//     {
//         title: "Learning from Failure in the Garden",
//         content: `## Every Dead Plant Is a Lesson

// Don't be discouraged by failures. We all have them.

// ### Common First-Year Failures:
// - Overwatering (more common than under)
// - Wrong planting time
// - Too much sun or shade
// - Ignoring pests until too late

// ### What to Do:
// 1. Note what happened
// 2. Research the cause
// 3. Try again differently
// 4. Share failure to help others learn

// ### Famous Failures:
// Even expert gardeners lose crops. Weather happens. Pests happen. That's gardening.

// ### Mindset Shift:
// It's not "I failed." It's "I learned what doesn't work."

// *My first year, I killed more than I grew. Ten years later, I teach others. Failure is the path.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Keeping a Garden Journal",
//         content: `## Your Most Valuable Garden Tool

// Memory fails. Paper remembers.

// ### What to Record:
// - Planting dates
// - Varieties planted
// - Weather notes
// - Pest/disease observations
// - Harvest amounts
// - What worked/didn't

// ### Format:
// - Simple notebook
// - Calendar with notes
// - Phone photos with dates
// - Whatever you'll actually use

// ### Review Annually:
// Each winter, read last year's notes. Learn from patterns.

// ### Sharing Value:
// Your records help others in similar conditions. Our collective knowledge grows.

// *Looking back at my journals, patterns emerge that I never noticed in the moment. Invaluable.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//     },
    
//     // ========== ADDITIONAL POSTS TO REACH 150+ ==========
    
//     // More Water Saving
//     {
//         title: "Solar Water Heater for Irrigation",
//         content: `## Warm Water Helps Plants in Winter

// Cold water can shock plant roots. Simple solar heating helps.

// ### Setup:
// - Black container/barrel in sun
// - Fill in morning
// - Use in afternoon (warmed)

// ### Benefits:
// - Less root shock
// - Better nutrient uptake
// - Faster growth in cool weather

// Cost: Free if you have a dark container.`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Reading Clouds for Rain Prediction",
//         content: `## Traditional Weather Reading for Gardeners

// Our grandfathers knew when rain was coming.

// ### Signs of Coming Rain:
// - Cumulonimbus clouds building from west
// - Humidity increasing (hair curls more!)
// - Ants building higher mounds
// - Birds flying lower

// ### Why It Matters:
// - Save water if rain coming
// - Harvest before storms
// - Prepare drainage

// *I check the sky every morning. Often know rain 24 hours ahead.*`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Optimizing Irrigation Pressure",
//         content: `## Low Pressure Wastes Less

// High pressure sprays = mist = evaporation loss.

// ### Ideal Pressure:
// - Drip systems: Low pressure best
// - Sprinklers: Medium (large droplets)
// - Hand watering: Gentle flow

// ### How to Reduce Pressure:
// - Use pressure reducer at spigot
// - Longer hoses naturally reduce pressure
// - Water when pressure is lower (early morning)

// *Reduced my pressure, reduced my water bill by 20%.*`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
//     {
//         title: "Moisture Meter - Simple Homemade Version",
//         content: `## Know When to Water Without Guessing

// ### Method 1 - Stick Test:
// Wooden stick (like chopstick) pushed into soil. Pull out - wet soil darkens the wood.

// ### Method 2 - Weight:
// Lift pot. Learn what "dry" and "wet" weights feel like.

// ### Method 3 - Finger:
// Simple but works. Soil dry at 2 inch depth = time to water.

// *Stopped overwatering since learning to test before watering.*`,
//         category: "water-saving",
//         journeyStage: "growing",
//     },
    
//     // More Composting
//     {
//         title: "Composting Human Waste (Humanure)",
//         content: `## Controversial But Traditional

// This is how our ancestors fertilized for millennia.

// ### Safety Requirements:
// - Thermophilic composting (hot pile)
// - 12+ months aging
// - Never on food crops in first year
// - Cover with carbon material

// ### Modern Method:
// Sawdust toilet → dedicated compost pile → fruit trees only

// **Warning:** Not for everyone. Research thoroughly before attempting.

// *Used in my orchard for 5 years. Trees are incredibly productive.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Composting Paper and Cardboard Products",
//         content: `## What's Safe, What's Not

// ### Safe to Compost:
// - Newspaper (black ink = soy-based)
// - Plain cardboard
// - Paper towels (unbleached best)
// - Egg cartons
// - Brown paper bags
// - Non-glossy junk mail

// ### Avoid:
// - Glossy magazines
// - Receipts (thermal paper = BPA)
// - Heavily printed packaging
// - Waxy cardboard

// *Paper products are my main "brown" material. Free and abundant.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Measuring Compost Temperature",
//         content: `## Know When Your Pile is Working

// ### Temperature Stages:
// - **Below 40°C:** Pile not active, needs nitrogen or water
// - **40-55°C:** Mesophilic stage, good decomposition
// - **55-70°C:** Thermophilic - fastest, kills seeds/pathogens
// - **Above 70°C:** Too hot! Turn to cool down

// ### Measuring Methods:
// - Compost thermometer (long probe)
// - Hand test: Can't hold hand in center = above 50°C
// - Steam rising = hot and working

// *Once I learned to read temperature, my compost improved dramatically.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },
//     {
//         title: "Leaf Mold - The Lazy Compost",
//         content: `## Just Leaves, Just Time

// Different from regular compost. Fungal decomposition.

// ### Method:
// 1. Collect fallen leaves
// 2. Pile or bag them
// 3. Keep moist
// 4. Wait 1-2 years
// 5. Get beautiful, crumbly leaf mold

// ### Uses:
// - Seed starting mix
// - Mulch
// - Soil conditioner
// - Potting mix ingredient

// *I make leaf mold every year. Best soil conditioner there is.*`,
//         category: "composting",
//         journeyStage: "compost",
//     },
    
//     // More Seed Saving
//     {
//         title: "Preventing Inbreeding Depression",
//         content: `## Why Population Size Matters

// Saving seed from one plant = genetic narrowing = weaker plants over time.

// ### Minimum Populations:
// - Self-pollinating (tomato, beans): 5-10 plants
// - Cross-pollinating (squash, corn): 20+ plants
// - Wind-pollinated (corn): 50+ ideal

// ### Signs of Inbreeding:
// - Reduced vigor
// - Lower germination
// - Smaller fruits
// - More disease

// ### Solution:
// - Save from many plants
// - Exchange seed with others
// - Introduce new genetics occasionally

// *Our community seed library prevents this - many people growing same variety.*`,
//         category: "seed-saving",
//         journeyStage: "seed",
//     },
//     {
//         title: "Saving Seeds from Grafted Plants",
//         content: `## Important Warning

// Many fruit trees and some vegetables are grafted. Seeds won't be true.

// ### Grafted Crops:
// - Most fruit trees (citrus, apple, stone fruits)
// - Some tomatoes
// - Cucumbers (occasionally)

// ### Why It Matters:
// Seeds from grafted plants = rootstock genetics OR unpredictable cross. Usually NOT like parent fruit.

// ### What To Do:
// - Propagate by cuttings instead
// - Learn grafting
// - Only save seed from seed-grown plants

// *Learned this the hard way - orange seeds didn't produce oranges like the parent.*`,
//         category: "seed-saving",
//         journeyStage: "seed",
//     },
//     {
//         title: "Winnowing and Cleaning Seed",
//         content: `## Separating Seed from Chaff

// Clean seed stores better and germinates better.

// ### Winnowing Method:
// 1. Put seeds in shallow container
// 2. Go outside on breezy day
// 3. Slowly pour seeds between two containers
// 4. Wind blows away light chaff
// 5. Heavy seed falls into container

// ### Screen Method:
// Different size screens separate seed from debris. Kitchen strainers work.

// ### Floating:
// Put seeds in water. Good seed sinks, bad seed and chaff float. Dry thoroughly after!

// *Well-cleaned seed is a pleasure to plant. Worth the extra effort.*`,
//         category: "seed-saving",
//         journeyStage: "harvest",
//     },
//     {
//         title: "Seed Saving from Perennials",
//         content: `## Different Timing Than Annuals

// Perennial plants have their own seed-saving rhythm.

// ### Examples:
// - **Asparagus:** Red berries in fall, ferment like tomato
// - **Artichoke:** Let flowers fully dry on plant
// - **Rhubarb:** Seeds often don't come true - divide instead
// - **Strawberry:** Seeds on surface, let fruit dry, scrape off

// ### When Perennials Seed True:
// - Most herbs (oregano, thyme, sage)
// - Asparagus
// - Some berries

// *Collected asparagus seed last year. Now have 100 seedlings for almost free.*`,
//         category: "seed-saving",
//         journeyStage: "harvest",
//     },
    
//     // More Crop Rotation
//     {
//         title: "Recording Your Rotation System",
//         content: `## Maps Make Rotation Possible

// Without records, rotation fails within a year.

// ### What to Map:
// - Draw garden layout
// - Label each bed/area
// - Record what's planted each season
// - Keep maps for 5+ years

// ### Simple System:
// Number or letter each bed. Use same IDs every year. Then just record "Bed A: Tomatoes 2024"

// ### Review Process:
// Each planting season, check last 3 years before deciding what goes where.

// *My rotation maps go back 8 years. Never guess what was where.*`,
//         category: "crop-rotation",
//         journeyStage: "seed",
//     },
//     {
//         title: "Breaking Rotation Rules Safely",
//         content: `## Sometimes You Must - How to Minimize Damage

// Space constraints force compromises. Here's how to minimize problems.

// ### When Breaking Rotation:
// 1. **Soil solarization** - Clear plastic for 6 weeks kills pathogens
// 2. **Heavy compost** - Beneficial organisms compete with problems
// 3. **Resistant varieties** - Choose disease-resistant types
// 4. **Extra vigilance** - Watch closely for disease, remove immediately

// ### What NOT to Break:
// Never plant nightshades after nightshades if you've had blight. The risk is total crop loss.

// *Sometimes I must put tomatoes back too soon. Extra compost and solarization help.*`,
//         category: "crop-rotation",
//         journeyStage: "seed",
//     },
//     {
//         title: "Rotation in Raised Beds and Containers",
//         content: `## Limited Space Solutions

// Even with few beds, rotation matters.

// ### 4 Beds = Full Rotation:
// - Bed A: Legumes → Brassicas → Nightshades → Roots → back to Legumes
// - Each bed follows same pattern, one step behind

// ### 2 Beds:
// Alternate heavy feeders and light feeders. Add more compost.

// ### Containers:
// - Change soil 50% each year
// - Rotate pot positions
// - Never same plant in same pot back-to-back

// *My 6 raised beds rotate perfectly. Mapped and recorded every season.*`,
//         category: "crop-rotation",
//         journeyStage: "seed",
//     },
    
//     // More Organic
//     {
//         title: "Identifying Beneficial vs Harmful Insects",
//         content: `## Not All Bugs Are Bad

// Before you spray, identify!

// ### Beneficial (Leave Them!):
// - Ladybugs and larvae (weird, spiky)
// - Lacewing larvae
// - Hoverfly larvae (look like caterpillars)
// - Parasitic wasps (tiny, don't sting)
// - Ground beetles

// ### Harmful:
// - Aphids (clusters on new growth)
// - Whiteflies (fly up when disturbed)
// - Caterpillars on cabbage family
// - Squash bugs

// ### When Unsure:
// Watch before acting. See what they're doing. Eating pests = good.

// *Once I learned identification, I stopped killing my allies.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },
//     {
//         title: "Trap Crops to Protect Main Crops",
//         content: `## Sacrifice Some to Save All

// Plant what pests prefer away from what you want to keep.

// ### Examples:
// - **Nasturtium:** Attracts aphids away from vegetables
// - **Radish:** Flea beetles prefer radish leaves
// - **Dill:** Attracts tomato hornworm (then hand pick)
// - **Squash:** Plant early sacrificial, protect later main crop

// ### Strategy:
// Plant trap crop 2 weeks before main crop. Pests colonize trap first. Destroy trap crop with pests.

// *Nasturtium border around my vegetables catches most aphids. Main crops stay clean.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },
//     {
//         title: "Milk Spray for Powdery Mildew",
//         content: `## Simple Fungicide That Works

// Milk! Yes, milk. Scientists confirmed it works.

// ### Recipe:
// - Mix 1 part milk (any kind) with 9 parts water
// - Spray on leaves
// - Apply weekly, more after rain

// ### Why It Works:
// Proteins in milk have antifungal properties. Also may trigger plant immune response.

// ### Best For:
// - Squash family (very prone to mildew)
// - Roses
// - Cucumbers
// - Grapes

// *Saved my zucchini from powdery mildew with weekly milk spray.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },
//     {
//         title: "Soil Testing Without a Lab",
//         content: `## Basic Home Tests for Soil Health

// ### pH Test (Cabbage Water):
// 1. Boil red cabbage, save purple water
// 2. Mix soil with water, add cabbage water
// 3. Pink = acidic, Blue = alkaline, Purple = neutral

// ### Drainage Test:
// Dig hole 30cm deep, fill with water. Good soil drains within 4 hours.

// ### Life Test:
// Dig up soil, count earthworms. 10+ per shovel = healthy soil.

// ### Jar Test (Texture):
// 1. Fill jar 1/3 with soil, add water
// 2. Shake and let settle 24 hours
// 3. Sand bottom, silt middle, clay top

// *These tests gave me enough information to improve my soil dramatically.*`,
//         category: "organic",
//         journeyStage: "growing",
//     },
    
//     // More Zero Waste
//     {
//         title: "Saving and Using Seeds from Cooking",
//         content: `## Kitchen Seeds That Grow

// Some seeds from store-bought produce are plantable.

// ### Often Works:
// - Tomatoes (heirloom types)
// - Peppers (especially local)
// - Squash and melons
// - Dried beans and peas
// - Fresh herbs with roots

// ### Rarely Works:
// - Hybrid produce
// - Heavily processed seeds
// - Irradiated imports

// ### Worth Trying:
// Even if only 50% germinate, it's free! Plant extra.

// *My best jalapeño came from a pepper I bought at the market.*`,
//         category: "zero-waste",
//         journeyStage: "seed",
//     },
//     {
//         title: "Using Every Part of the Plant",
//         content: `## Leaves, Stems, Roots - All Useful

// We throw away edible parts constantly.

// ### Commonly Wasted, Actually Edible:
// - Carrot tops (pesto, salads)
// - Beet greens (cook like chard)
// - Radish leaves (cook or salad)
// - Broccoli stems (peel, slice, cook)
// - Squash leaves (cook)
// - Cauliflower leaves (cook)

// ### Even Peels:
// - Potato peels (fry as chips)
// - Citrus peels (zest, candy, cleaner)
// - Onion skins (compost or dye)

// *Started eating the "waste" and now I get 30% more food from same plants.*`,
//         category: "zero-waste",
//         journeyStage: "harvest",
//     },
//     {
//         title: "Collecting and Using Wood Ash",
//         content: `## Don't Throw Away Fireplace Ash

// Wood ash is valuable garden amendment.

// ### Benefits:
// - Raises pH (good for acidic soil)
// - Adds potassium
// - Adds calcium
// - Deters some pests

// ### How to Use:
// - Light dusting around plants
// - Mix into compost
// - Add to tomato planting holes

// ### Caution:
// - Don't use on acid-loving plants
// - Don't use coal ash (heavy metals)
// - Don't overuse (can raise pH too much)

// *Collect all winter, use all spring. Free fertilizer.*`,
//         category: "zero-waste",
//         journeyStage: "compost",
//     },
//     {
//         title: "Making Plant Markers from Waste",
//         content: `## Never Buy Labels Again

// ### Ideas:
// - Broken pots → Write on shards
// - Sticks → Burn in letters
// - Old blinds → Cut into strips
// - Stones → Paint on
// - Corks → On sticks
// - Plastic bottles → Cut into labels

// ### Weatherproofing:
// Pencil lasts longer than marker outdoors. Or use outdoor paint.

// *My markers come from broken things. Free and more interesting than bought ones.*`,
//         category: "zero-waste",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Building with Garden Waste",
//         content: `## Construction from Prunings

// Large prunings don't need to be burned.

// ### Uses:
// - Bean poles and stakes
// - Trellises and supports
// - Garden edging
// - Wattle fencing
// - Hugelkultur cores
// - Mulch paths

// ### Processing:
// - Straight pieces → stakes
// - Forked pieces → supports
// - Thin flexible pieces → weaving
// - Everything else → chop and compost

// *Built entire trellis system from olive prunings. Strong and free.*`,
//         category: "zero-waste",
//         journeyStage: "full-cycle",
//     },
    
//     // More General
//     {
//         title: "Dealing with Extreme Heat Days",
//         content: `## Protecting Plants When It's 45°C

// Our summers are harsh. Plants need help.

// ### Immediate Actions:
// - Shade cloth (emergency: old sheets)
// - Deep watering before heat wave
// - Mulch heavily
// - Don't fertilize (stresses plant more)

// ### Which Plants Survive:
// - Established trees and shrubs
// - Mediterranean herbs
// - Heat-tolerant vegetables (okra, eggplant)

// ### Which to Protect:
// - Seedlings and transplants
// - Leafy greens
// - Cool-season crops

// *Lost crops to heat before learning these lessons. Prevention is everything.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Vertical Gardening for Small Spaces",
//         content: `## Grow Up, Not Out

// When ground space is limited, use walls and height.

// ### Methods:
// - Trellises for climbers (beans, cucumbers, squash)
// - Hanging containers
// - Wall pockets
// - Stacked containers
// - A-frame structures

// ### Best Vertical Crops:
// - Pole beans (not bush)
// - Cucumbers
// - Peas
// - Small melons (support fruit)
// - Tomatoes (indeterminate)

// ### Benefits:
// - More production per square meter
// - Better air circulation (less disease)
// - Easier harvesting
// - Decorative

// *My 3-meter wall produces as much as 10 square meters of ground space.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Night Gardening - Using Cool Hours",
//         content: `## Why I Garden After Dark

// In summer, midday gardening is miserable and damaging.

// ### Benefits of Evening/Night:
// - Cooler for you
// - Transplants less shocked
// - Watering more effective (less evaporation)
// - Pests less active

// ### Good Tasks for Night:
// - Transplanting
// - Watering
// - Slug hunting (they're out at night)
// - Planning and observing

// ### Lighting:
// Headlamp for focused work. Phone flashlight works. Learn your garden layout.

// *Summer months, I garden from 7pm to 10pm. Plants and I both prefer it.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Growing Food for Storage",
//         content: `## Plan for the Off-Season

// Some crops store for months. Plan now, eat later.

// ### Long-Storage Crops:
// - Winter squash (6+ months)
// - Onions and garlic (8+ months)
// - Potatoes (6 months in dark)
// - Dried beans (years)
// - Root vegetables in sand

// ### Growing for Storage:
// - Harvest mature, not early
// - Cure properly (squash, onions, garlic)
// - Handle gently (bruises rot)
// - Store cool and dark

// *My storage crops from fall feed family through winter and spring.*`,
//         category: "general",
//         journeyStage: "harvest",
//     },
//     {
//         title: "Intercropping for Maximum Production",
//         content: `## Two Crops, One Space

// Grow fast and slow crops together.

// ### Classic Combinations:
// - Radish (fast) + Carrots (slow)
// - Lettuce (fast) + Tomatoes (slow, taller)
// - Beans + Corn (vertical stacking)
// - Spinach + Cabbage

// ### How It Works:
// Fast crop harvests before slow crop needs the space. You get two harvests from same bed.

// ### Planning Required:
// Think about:
// - Growth rates
// - Final sizes
// - Light needs
// - Root depths

// *Intercropping increased my production by 50% without more space.*`,
//         category: "general",
//         journeyStage: "seed",
//     },
//     {
//         title: "Reading Your Plants - Signs of Trouble",
//         content: `## Plants Talk - Learn to Listen

// Every problem shows symptoms before crisis.

// ### Yellow Leaves:
// - Old leaves: Usually nitrogen deficiency
// - New leaves: Usually iron or chlorosis
// - Between veins: Magnesium or manganese
// - All over: Overwatering or root problems

// ### Holes in Leaves:
// - Large irregular: Caterpillars or slugs
// - Small round: Flea beetles
// - Skeletonized: Japanese beetles or larvae

// ### Wilting:
// - Soil dry: Needs water
// - Soil wet: Root rot or disease
// - Only midday: Normal heat stress

// *Learned to spot problems early. Much easier to fix when caught fast.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Microclimates in Your Garden",
//         content: `## Every Garden Has Multiple Climates

// Understanding them expands what you can grow.

// ### Warm Spots:
// - South-facing walls
// - Protected corners
// - Near buildings

// **Use for:** Heat lovers, early starts, extending season

// ### Cool Spots:
// - North-facing areas
// - Under trees
// - Low areas where cold settles

// **Use for:** Lettuce in summer, bolt-prone crops

// ### How to Map:
// Place thermometers in different spots. Check morning, afternoon, night.

// *Found a warm corner that's 5°C warmer. My peppers thrive there.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Building Soil Fertility Over Years",
//         content: `## The Long Game of Great Soil

// Soil improvement compounds over time.

// ### Year 1:
// Add compost, start composting, plant cover crops. Soil is mediocre.

// ### Year 3:
// Noticeable improvement. More worms, better water retention, healthier plants.

// ### Year 5:
// Soil becomes dark, crumbly, alive. Much less watering and fertilizing needed.

// ### Year 10+:
// Truly exceptional soil. Plants almost grow themselves. Disease rare.

// ### Keys:
// - Never leave soil bare
// - Add organic matter constantly
// - Don't over-till
// - Rotate crops
// - Be patient

// *My oldest bed is 12 years of building. The soil is like chocolate cake now.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//     },
//     {
//         title: "Supporting Plants Properly",
//         content: `## Stakes, Cages, and Trellises Done Right

// Good support = more production, less disease.

// ### Tomatoes:
// - Stake: Prune to 1-2 stems
// - Cage: Let grow naturally
// - Florida weave: Commercial, efficient

// ### Peppers and Eggplant:
// - Light stake when fruiting heavy
// - Cage for large varieties

// ### Climbers (Beans, Cukes):
// - Trellis must be strong
// - Install BEFORE planting
// - 2 meter height minimum

// ### DIY Materials:
// Bamboo, prunings, string, wire mesh, old fencing

// *Proper support doubled my tomato harvest. Plants stayed healthy to frost.*`,
//         category: "general",
//         journeyStage: "growing",
//     },
//     {
//         title: "Growing Food Through Conflict",
//         content: `## When Everything Is Uncertain

// Gardens provide when nothing else is stable.

// ### Priority Crops:
// 1. Calories: Potatoes, beans, squash
// 2. Speed: Leafy greens (30 days)
// 3. Resilience: What survives neglect

// ### Low-Input Strategies:
// - Rainwater only if possible
// - No purchased fertilizer (compost only)
// - Seed saving (no buying)
// - Perennials (plant once)

// ### Community Matters:
// - Share knowledge
// - Share seeds
// - Share harvest
// - Watch each other's gardens

// *Our gardens kept families fed through the hardest times. Growing food is resistance.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//         isPinned: true,
//     },
//     {
//         title: "Traditional Palestinian Farming Wisdom",
//         content: `## Lessons from Our Grandparents

// They farmed this land for generations without chemicals.

// ### Wisdom Passed Down:
// - "Plant with the moon" - timing matters
// - "Feed the soil, not the plant" - build organic matter
// - "Watch what grows wild" - indicates soil conditions
// - "Save the best seed" - always improve
// - "Share with neighbors" - community survives

// ### Traditional Crops:
// - Baladi varieties adapted over centuries
// - Drought-resistant by nature
// - Flavor developed for our cuisine

// ### Combining Old and New:
// Traditional wisdom + modern understanding = best results

// *Everything I know started with what my grandmother taught me.*`,
//         category: "general",
//         journeyStage: "full-cycle",
//         isVerified: true,
//     },
// ];

// async function seedDatabase() {
//     try {
//         console.log("🌱 Connecting to MongoDB...");
//         const uri = getMongoUri();
//         await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
//         console.log("✅ Connected to MongoDB");

//         // Optional: Clear existing posts (comment out if you want to keep existing)
//         // console.log("🗑️ Clearing existing forum posts...");
//         // await ForumPost.deleteMany({});

//         console.log(`📝 Seeding ${FORUM_POSTS.length} forum posts...`);

//         const postsToInsert = FORUM_POSTS.map((post) => {
//             const user = randomUser();
//             const commentCount = Math.floor(Math.random() * 12) + 1; // 1-12 comments per post
//             return {
//                 ...post,
//                 userId: user.id,
//                 userName: user.name,
//                 country: "Palestine",
//                 region: "Gaza",
//                 likes: randomLikes(Math.random() > 0.5 ? 30 : 10),
//                 commentCount: commentCount,
//                 createdAt: randomDate(365),
//                 updatedAt: new Date(),
//             };
//         });

//         // Insert posts in batches
//         const batchSize = 50;
//         const insertedPosts: Array<{ _id: mongoose.Types.ObjectId; commentCount: number; createdAt: Date }> = [];
        
//         for (let i = 0; i < postsToInsert.length; i += batchSize) {
//             const batch = postsToInsert.slice(i, i + batchSize);
//             const result = await ForumPost.insertMany(batch);
//             result.forEach((p: { _id: mongoose.Types.ObjectId; commentCount: number; createdAt: Date }) => {
//                 insertedPosts.push({ _id: p._id, commentCount: p.commentCount, createdAt: p.createdAt });
//             });
//             console.log(`   Inserted ${Math.min(i + batchSize, postsToInsert.length)}/${postsToInsert.length} posts`);
//         }

//         // Now create comments for each post
//         console.log("\n📝 Generating comments for posts...");
//         let totalComments = 0;
//         const commentsToInsert: Array<{
//             postId: string;
//             userId: string;
//             userName: string;
//             content: string;
//             likes: string[];
//             createdAt: Date;
//             updatedAt: Date;
//         }> = [];

//         for (const post of insertedPosts) {
//             for (let c = 0; c < post.commentCount; c++) {
//                 const commentUser = randomUser();
//                 // Comments should be after post creation but before now
//                 const postTime = post.createdAt.getTime();
//                 const now = Date.now();
//                 const commentTime = new Date(postTime + Math.random() * (now - postTime));
                
//                 commentsToInsert.push({
//                     postId: post._id.toString(),
//                     userId: commentUser.id,
//                     userName: commentUser.name,
//                     content: randomComment(),
//                     likes: randomLikes(5),
//                     createdAt: commentTime,
//                     updatedAt: commentTime,
//                 });
//                 totalComments++;
//             }
//         }

//         // Insert comments in batches
//         for (let i = 0; i < commentsToInsert.length; i += batchSize) {
//             const batch = commentsToInsert.slice(i, i + batchSize);
//             await ForumComment.insertMany(batch);
//             if ((i + batchSize) % 200 === 0 || i + batchSize >= commentsToInsert.length) {
//                 console.log(`   Inserted ${Math.min(i + batchSize, commentsToInsert.length)}/${commentsToInsert.length} comments`);
//             }
//         }

//         console.log("\n✅ Seeding complete!");
//         console.log(`   Total posts: ${postsToInsert.length}`);
//         console.log(`   Total comments: ${totalComments}`);
//         console.log(`   Pinned posts: ${postsToInsert.filter(p => p.isPinned).length}`);
//         console.log(`   Verified posts: ${postsToInsert.filter(p => p.isVerified).length}`);

//         // Category breakdown
//         const categories = new Map<string, number>();
//         postsToInsert.forEach(p => {
//             categories.set(p.category, (categories.get(p.category) || 0) + 1);
//         });
//         console.log("\n📊 Posts by category:");
//         categories.forEach((count, cat) => {
//             console.log(`   ${cat}: ${count}`);
//         });

//     } catch (error) {
//         console.error("❌ Seeding failed:", error);
//         process.exit(1);
//     } finally {
//         await mongoose.disconnect();
//         console.log("\n👋 Disconnected from MongoDB");
//         process.exit(0);
//     }
// }

// // Run the seeder
// seedDatabase();
