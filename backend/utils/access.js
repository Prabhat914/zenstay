export const getAdminEmails = () =>
    String(process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((email) => String(email || "").trim().toLowerCase())
        .filter(Boolean)

export const isAdminUser = (user) => {
    if (!user) return false
    if (user.isAdmin === true) return true
    const email = String(user.email || "").trim().toLowerCase()
    return Boolean(email && getAdminEmails().includes(email))
}
