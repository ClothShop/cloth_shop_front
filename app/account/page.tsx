"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AccountProfile } from "@/components/account-profile"
import { AccountOrders } from "@/components/account-orders"
import { AccountAddresses } from "@/components/account-addresses"
import { AccountWallet } from "@/components/account-wallet"
import { useAuth } from "@/lib/auth-provider"
import { LogOut } from "lucide-react"

export default function AccountPage() {
  const { user, loading, isAdmin, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
              <p className="text-muted-foreground">Manage your account settings and view orders</p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <Button
                  onClick={() => router.push("/admin/dashboard")}
                  className="inline-flex h-10 items-center justify-center"
                >
                  Admin Dashboard
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout} className="inline-flex h-10 items-center justify-center">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
          <Tabs defaultValue="profile" className="mt-8">
            <TabsList className="w-full max-w-md grid grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <AccountProfile user={user} />
            </TabsContent>
            <TabsContent value="wallet" className="mt-6">
              <AccountWallet />
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
              <AccountOrders />
            </TabsContent>
            <TabsContent value="addresses" className="mt-6">
              <AccountAddresses />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
