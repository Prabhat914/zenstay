import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
export const authDataContext = createContext()
function AuthContext({children}) {
    const prodApiUrl = "https://backend-gray-ten-66.vercel.app"
    const serverUrl = import.meta.env.DEV ? "http://localhost:8000" : prodApiUrl

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
