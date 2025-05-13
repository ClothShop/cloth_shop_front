"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-provider"
import { Wallet, Plus, Minus } from "lucide-react"

export function AccountWallet() {
  const { user, addFunds, withdrawFunds } = useAuth()
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAddFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return

    setIsProcessing(true)
    await addFunds(Number(amount))
    setAmount("")
    setIsProcessing(false)
  }

  const handleWithdrawFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return

    setIsProcessing(true)
    await withdrawFunds(Number(amount))
    setAmount("")
    setIsProcessing(false)
  }
  const isDisabled =
      isProcessing || !amount || Number(amount) <= 0 ||
      (user ? Number(amount) > user.walletBalance : false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Manage your funds</CardDescription>
          </div>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current Balance</span>
            <span className="text-2xl font-bold">${user?.walletBalance.toFixed(2)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              disabled={isProcessing}
            />
            <Button
              onClick={handleAddFunds}
              disabled={isProcessing || !amount || Number(amount) <= 0}
              className="whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Funds
            </Button>
            <Button
              variant="outline"
              onClick={handleWithdrawFunds}
              disabled={isDisabled}
              className="whitespace-nowrap"
            >
              <Minus className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
        <p>Funds are used for purchases on our platform.</p>
      </CardFooter>
    </Card>
  )
}
