import ContactMessage from "../model/contactMessage.model.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!String(name || "").trim()) {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!emailRegex.test(String(email || "").trim())) {
            return res.status(400).json({ message: "Valid email is required" });
        }
        if (!String(message || "").trim()) {
            return res.status(400).json({ message: "Message is required" });
        }

        const saved = await ContactMessage.create({
            name: String(name).trim(),
            email: String(email).trim(),
            subject: String(subject || "").trim(),
            message: String(message).trim()
        });

        return res.status(201).json({
            message: "Contact message submitted successfully",
            id: saved._id
        });
    } catch (error) {
        return res.status(500).json({ message: `submitContactForm error ${error}` });
    }
};

