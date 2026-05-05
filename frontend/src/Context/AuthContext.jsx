import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
export const authDataContext = createContext()

const DEFAULT_PROD_API_URL = "https://zenstay-60a7.onrender.com"
const DEFAULT_DEV_API_URL = "http://localhost:8000"

function AuthContext({children}) {
    const normalizeUrl = (value) => String(value || "").trim().replace(/\/+$/, "")
    const prodApiUrl = normalizeUrl(import.meta.env.VITE_API_URL) || DEFAULT_PROD_API_URL
    const devApiUrl = normalizeUrl(import.meta.env.VITE_DEV_API_URL) || DEFAULT_DEV_API_URL
    const serverUrl = import.meta.env.DEV ? devApiUrl : prodApiUrl

    let [loading,setLoading]=useState(false)
    const [authToken, setAuthToken] = useState(() => localStorage.getItem("zenstay_token") || "")

    const clearAuthSession = () => {
        setAuthToken("")
        localStorage.removeItem("zenstay_token")
        localStorage.removeItem("zenstay_user")
        delete axios.defaults.headers.common.Authorization
    }

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
        authToken,setAuthToken,
        clearAuthSession
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
