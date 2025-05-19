"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createPromoCode, updatePromoCode } from "@/lib/api"
import type { PromoCode } from "@/types"

interface PromoCodeFormProps {
  promoCode?: PromoCode
  onSave: (promoCode: PromoCode) => void
  onCancel: () => void
}

export function PromoCodeForm({ promoCode, onSave, onCancel }: PromoCodeFormProps) {
  const [code, setCode] = useState(promoCode?.code || "")
  const [discountPercentage, setDiscountPercentage] = useState(promoCode?.discount_percentage.toString() || "10")
  const [validFrom, setValidFrom] = useState(
    promoCode?.valid_from
      ? new Date(promoCode.valid_from).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  )
  const [validTo, setValidTo] = useState(
    promoCode?.valid_to
      ? new Date(promoCode.valid_to).toISOString().split("T")[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  )
  const [isActive, setIsActive] = useState(promoCode?.is_active ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!code.trim()) {
      setError("Promo code is required")
      return
    }

    const discount = Number.parseInt(discountPercentage)
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      setError("Discount must be between 1 and 100")
      return
    }

    setIsSubmitting(true)
    try {
      const promoData = {
        code: code.trim().toUpperCase(),
        discount_percentage: discount,
        valid_from: new Date(validFrom).toISOString(),
        valid_to: new Date(validTo).toISOString(),
        is_active: isActive,
      }

      let savedPromoCode
      if (promoCode) {
        savedPromoCode = await updatePromoCode(promoCode._id, promoData)
      } else {
        savedPromoCode = await createPromoCode(promoData)
      }

      onSave(savedPromoCode)
    } catch (error) {
      console.error("Failed to save promo code:", error)
      setError("Failed to save promo code. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Promo Code</Label>
        <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER2023" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="discount">Discount Percentage</Label>
        <Input
          id="discount"
          type="number"
          min="1"
          max="100"
          value={discountPercentage}
          onChange={(e) => setDiscountPercentage(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Valid From</Label>
          <Input id="validFrom" type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validTo">Valid To</Label>
          <Input id="validTo" type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="isActive">Active</Label>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  )
}
