import User from "../model/user.model.js"
import { isAdminUser } from "../utils/access.js"

const isAdmin = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Authentication required" })
        }

        const user = await User.findById(req.userId).select("email isAdmin")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (!isAdminUser(user)) {
            return res.status(403).json({ message: "Admin access required" })
        }

        req.adminUser = user
        next()
    } catch (error) {
        return res.status(500).json({ message: `isAdmin error ${error}` })
    }
}

export default isAdmin
