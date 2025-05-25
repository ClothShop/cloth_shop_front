"use client"

import {createContext, type ReactNode, useContext, useEffect, useState} from "react"
import axios from "axios"
import type {User} from "@/types"
import {useToast} from "@/hooks/use-toast"
import {useRouter} from "next/navigation";

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  addFunds: (amount: number) => Promise<void>
  withdrawFunds: (amount: number) => Promise<void>
  hasEnoughFunds: (amount: number) => boolean
}

interface RegisterData {
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem("user")
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        } else {
          const response = await axios.get("http://localhost:8888/api/v1/auth/users/me",
              {withCredentials: true}
          )
          const { user } = response.data
          user.walletBalance = 1000
          setUser(user)
          localStorage.setItem("user", JSON.stringify(user))
          router.push("/account")
        }
      } catch (error) {
        console.error("Authentication error:", error)
        localStorage.removeItem("user")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await axios.post("http://localhost:8888/api/v1/auth/login",
           {email, password,},
           {withCredentials: true}
       )
      const response = await axios.get("http://localhost:8888/api/v1/auth/users/me",
          {withCredentials: true}
      )
      const { user } = response.data
      user.walletBalance = 1000
      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post("http://localhost:8888/api/v1/auth/register", {
        email: userData.email,
        password: userData.password,
      })
      const { newUser } = response.data

      localStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await axios.post("http://localhost:8888/api/v1/auth/logout", {}, { withCredentials: true })
      const shippingAddress = localStorage.getItem("shippingAddress")
      localStorage.clear()
      if (shippingAddress) {
        localStorage.setItem("shippingAddress", shippingAddress)
      }
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  const addFunds = async (amount: number) => {
    if (!user) return

    try {
      // In a real app, this would be an API call
      const updatedUser = {
        ...user,
        walletBalance: user.walletBalance + amount,
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      toast({
        title: "Funds Added",
        description: `$${amount.toFixed(2)} has been added to your wallet.`,
      })
    } catch (error) {
      console.error("Error adding funds:", error)
      toast({
        title: "Error",
        description: "Failed to add funds. Please try again.",
        variant: "destructive",
      })
    }
  }

  const withdrawFunds = async (amount: number) => {
    if (!user) return

    if (user.walletBalance < amount) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough funds for this withdrawal.",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real app, this would be an API call
      const updatedUser = {
        ...user,
        walletBalance: user.walletBalance - amount,
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      toast({
        title: "Funds Withdrawn",
        description: `$${amount.toFixed(2)} has been withdrawn from your wallet.`,
      })
    } catch (error) {
      console.error("Error withdrawing funds:", error)
      toast({
        title: "Error",
        description: "Failed to withdraw funds. Please try again.",
        variant: "destructive",
      })
    }
  }

  const hasEnoughFunds = (amount: number): boolean => {
    return user ? user.walletBalance >= amount : false
  }

  const isAdmin = user?.role === "Admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        addFunds,
        withdrawFunds,
        hasEnoughFunds,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
