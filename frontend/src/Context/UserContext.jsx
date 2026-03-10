import React, { createContext, useEffect, useState } from 'react'
import { useContext } from 'react'
import { authDataContext } from './AuthContext'
import axios from 'axios'
export const userDataContext = createContext()

const getStoredUser = () => {
    try {
        const raw = localStorage.getItem("zenstay_user")
        if (!raw) return null
        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === "object" ? parsed : null
    } catch {
        return null
    }
}

function UserContext({children}) {
     let {serverUrl,authToken} = useContext(authDataContext)
     let [userData,setUserData] = useState(() => getStoredUser())
     const buildAuthConfig = () => {
        const token = localStorage.getItem("zenstay_token") || authToken
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        return { withCredentials: true, headers }
     }
     const storedUser = getStoredUser()
     const resolvedUser = userData && typeof userData === "object" && userData._id ? userData : storedUser
     const isAuthenticated = Boolean(resolvedUser?._id || localStorage.getItem("zenstay_token") || authToken)
     

     const getCurrentUser = async () => {

        try {
            if (!serverUrl) {
                return
            }
            let result = await axios.get(serverUrl + "/api/user/currentuser", buildAuthConfig())
            const data = result.data
            const isValidUserObject = data && typeof data === "object" && !Array.isArray(data) && data._id
            if (isValidUserObject) {
                setUserData(data)
                localStorage.setItem("zenstay_user", JSON.stringify(data))
            } else if (!isAuthenticated) {
                setUserData(null)
                localStorage.removeItem("zenstay_user")
            }
        } catch (error) {
            console.log(error)
            // Keep existing local session on transient API/cookie issues.
            const hasToken = Boolean(localStorage.getItem("zenstay_token") || authToken)
            if (!hasToken) {
                setUserData(null)
                localStorage.removeItem("zenstay_user")
            }
            
        }
        
     }
        useEffect(()=>{
            getCurrentUser()
        },[serverUrl,authToken])

        useEffect(() => {
            if (userData && typeof userData === "object" && userData._id) {
                localStorage.setItem("zenstay_user", JSON.stringify(userData))
                return
            }
            if (!localStorage.getItem("zenstay_token")) {
                localStorage.removeItem("zenstay_user")
            }
        }, [userData])

    let value={
        userData: resolvedUser,
        setUserData,getCurrentUser
        ,isAuthenticated
    }
  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
