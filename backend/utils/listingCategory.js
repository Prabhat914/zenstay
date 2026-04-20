const categoryAliases = {
    villa: "villa",
    villas: "villa",
    farmhouse: "farmHouse",
    "farm house": "farmHouse",
    farm: "farmHouse",
    farmhouses: "farmHouse",
    "pool house": "poolHouse",
    poolhouse: "poolHouse",
    "pool home": "poolHouse",
    "pool homes": "poolHouse",
    pools: "poolHouse",
    room: "rooms",
    rooms: "rooms",
    flat: "flat",
    flats: "flat",
    apartment: "flat",
    apartments: "flat",
    pg: "pg",
    pgs: "pg",
    cabin: "cabin",
    cabins: "cabin",
    shop: "shops",
    shops: "shops",
    store: "shops",
    stores: "shops"
}

const categoryImageMatchers = [
    { category: "farmHouse", patterns: ["farm-house", "farmhouse", "farm house", "orchard", "meadow", "rain studio"] },
    { category: "poolHouse", patterns: ["poolhouse", "pool house", "pool-home", "pool home", "poolside", "courtyard-pool"] },
    { category: "villa", patterns: ["villa", "villas"] },
    { category: "rooms", patterns: ["room", "rooms", "suite", "hotel-room", "bedroom"] },
    { category: "flat", patterns: ["flat", "flats", "apartment", "apartments", "studio"] },
    { category: "pg", patterns: ["pg", "hostel", "shared-room", "paying guest"] },
    { category: "cabin", patterns: ["cabin", "cabins", "woodhouse", "wood-house", "pine"] },
    { category: "shops", patterns: ["shop", "shops", "store", "retail", "showroom"] }
]

const normalizeCategoryKey = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")

export const normalizeListingCategory = (value) => {
    const normalizedKey = normalizeCategoryKey(value)
    return categoryAliases[normalizedKey] || ""
}

export const inferListingCategoryFromImages = (...images) => {
    const joinedImages = images
        .flat()
        .filter(Boolean)
        .map((image) => normalizeCategoryKey(image))
        .join(" ")

    if (!joinedImages) {
        return ""
    }

    const match = categoryImageMatchers.find(({ patterns }) =>
        patterns.some((pattern) => joinedImages.includes(pattern))
    )

    return match?.category || ""
}

export const resolveListingCategory = ({ category, image1, image2, image3 }) =>
    normalizeListingCategory(category) ||
    inferListingCategoryFromImages(image1, image2, image3) ||
    ""
