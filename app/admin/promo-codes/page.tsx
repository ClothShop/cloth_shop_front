"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminLayout } from "@/components/admin-layout"
import { useAuth } from "@/lib/auth-provider"
import { fetchPromoCodes, deletePromoCode } from "@/lib/api"
import type { PromoCode } from "@/types"
import { PromoCodeForm } from "@/components/promo-code-form"

export default function AdminPromoCodesPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [promoToDelete, setPromoToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddingPromo, setIsAddingPromo] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/login")
    }
  }, [loading, isAdmin, router])

  useEffect(() => {
    const getPromoCodes = async () => {
      setDataLoading(true)
      try {
        const codes = await fetchPromoCodes()
        // Ensure we have valid promo codes with all required properties
        const validCodes = Array.isArray(codes)
          ? codes.filter(
              (code) =>
                code && typeof code === "object" && typeof code.code === "string" && typeof code.id === "string",
            )
          : []
        setPromoCodes(validCodes)
      } catch (error) {
        console.error("Failed to fetch promo codes:", error)
        setPromoCodes([])
      } finally {
        setDataLoading(false)
      }
    }

    if (isAdmin) {
      getPromoCodes()
    }
  }, [isAdmin])

  const handleDeletePromoCode = async () => {
    if (!promoToDelete) return

    setIsDeleting(true)
    try {
      await deletePromoCode(promoToDelete)
      setPromoCodes((prevCodes) => prevCodes.filter((code) => code.id !== promoToDelete))
      setPromoToDelete(null)
    } catch (error) {
      console.error("Failed to delete promo code:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePromoCodeSaved = (promoCode: PromoCode) => {
    if (editingPromo) {
      setPromoCodes((prevCodes) => prevCodes.map((code) => (code.id === promoCode.id ? promoCode : code)))
      setEditingPromo(null)
    } else {
      setPromoCodes((prevCodes) => [...prevCodes, promoCode])
      setIsAddingPromo(false)
    }
  }

  // Safely filter promo codes, ensuring each code has a valid code property
  const filteredPromoCodes = Array.isArray(promoCodes)
    ? promoCodes.filter((code) => {
        if (!code || typeof code !== "object" || typeof code.code !== "string") {
          return false
        }
        return code.code.toLowerCase().includes(searchTerm.toLowerCase())
      })
    : []

  if (loading) {
    return <p>Loading...</p>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
        <Button onClick={() => setIsAddingPromo(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Promo Code
        </Button>
      </div>
      <div className="mt-6 space-y-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search promo codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {dataLoading ? (
          <p>Loading promo codes...</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Valid From</TableHead>
                  <TableHead>Valid To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromoCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No promo codes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromoCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-medium">{code.code}</TableCell>
                      <TableCell>{code.discountPercentage}%</TableCell>
                      <TableCell>{new Date(code.validFrom).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(code.validTo).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            code.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {code.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => setEditingPromo(code)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => setPromoToDelete(code.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <Dialog open={!!promoToDelete} onOpenChange={(open) => !open && setPromoToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promo Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this promo code? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePromoCode} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddingPromo} onOpenChange={setIsAddingPromo}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Promo Code</DialogTitle>
            <DialogDescription>Create a new promo code for your customers.</DialogDescription>
          </DialogHeader>
          <PromoCodeForm onSave={handlePromoCodeSaved} onCancel={() => setIsAddingPromo(false)} />
        </DialogContent>
      </Dialog>
      <Dialog open={!!editingPromo} onOpenChange={(open) => !open && setEditingPromo(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
            <DialogDescription>Update the details of this promo code.</DialogDescription>
          </DialogHeader>
          {editingPromo && (
            <PromoCodeForm
              promoCode={editingPromo}
              onSave={handlePromoCodeSaved}
              onCancel={() => setEditingPromo(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
