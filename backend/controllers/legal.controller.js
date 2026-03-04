import LegalPage from "../model/legalPage.model.js";

const DEFAULT_LEGAL_PAGES = {
    "about-us": {
        title: "About Us",
        content:
            "Zenstay is a stay-booking platform for villas, farm houses, pool houses, rooms, flats, PGs, cabins and shops. Our goal is to keep booking simple, transparent, and fast for guests and hosts."
    },
    "privacy-policy": {
        title: "Privacy Policy",
        content:
            "We collect only required account and booking information to provide the service. Your personal information is not sold to third parties. Data is used for bookings, account management, and service communication."
    },
    "terms-and-conditions": {
        title: "Terms & Conditions",
        content:
            "By using Zenstay, you agree to provide accurate details, follow booking rules, and respect property policies. Hosts and guests are responsible for lawful usage and valid information during listing and booking."
    },
    "refund-policy": {
        title: "Refund Policy",
        content:
            "Refund eligibility depends on cancellation timing and booking status. Approved refunds are processed to the original payment method as per payment partner timelines."
    }
};

const ensureDefaultLegalPage = async (slug) => {
    const fallback = DEFAULT_LEGAL_PAGES[slug];
    if (!fallback) return null;
    return LegalPage.findOneAndUpdate(
        { slug },
        { $setOnInsert: { slug, title: fallback.title, content: fallback.content } },
        { upsert: true, new: true }
    );
};

export const getLegalPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        let page = await LegalPage.findOne({ slug });
        if (!page) {
            page = await ensureDefaultLegalPage(slug);
        }
        if (!page) {
            return res.status(404).json({ message: "Legal page not found" });
        }
        return res.status(200).json(page);
    } catch (error) {
        return res.status(500).json({ message: `getLegalPageBySlug error ${error}` });
    }
};

export const getAllLegalPages = async (req, res) => {
    try {
        await Promise.all(Object.keys(DEFAULT_LEGAL_PAGES).map((slug) => ensureDefaultLegalPage(slug)));
        const pages = await LegalPage.find().sort({ title: 1 });
        return res.status(200).json(pages);
    } catch (error) {
        return res.status(500).json({ message: `getAllLegalPages error ${error}` });
    }
};

