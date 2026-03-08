import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
export const authDataContext = createContext()
function AuthContext({children}) {
    const rawApiUrl = import.meta.env.VITE_API_URL || ""
    const fallbackProdApiUrl = "https://zenstay-60a7.onrender.com"
    const serverUrl = String(rawApiUrl).trim().replace(/\/+$/, "") || (import.meta.env.DEV ? "http://localhost:8000" : fallbackProdApiUrl)

    let [loading,setLoading]=useState(false)
    const [authToken, setAuthToken] = useState(() => localStorage.getItem("zenstay_token") || "")

    useEffect(() => {
        if (authToken) {
            localStorage.setItem("zenstay_token", authToken)
            axios.defaults.headers.common.Authorization = `Bearer ${authToken}`
            return
        }
        localStorage.removeItem("zenstay_token")
        delete axios.defaults.headers.common.Authorization
    }, [authToken])

    let value={
        serverUrl,
        loading,setLoading,
        authToken,setAuthToken
    }
  return (
    <div>
     <authDataContext.Provider value={value}>
        {children}
     </authDataContext.Provider>
    </div>
  )
}

export default AuthContext
