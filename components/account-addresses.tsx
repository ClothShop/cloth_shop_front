"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Address } from "@/types"

export function AccountAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      firstName: "John",
      lastName: "Doe",
      address1: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      phone: "555-123-4567",
    },
  ])
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [currentAddress, setCurrentAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  })

  const handleEdit = (index: number) => {
    setEditIndex(index)
    setCurrentAddress(addresses[index])
    setIsEditing(true)
    setIsAdding(false)
  }

  const handleAdd = () => {
    setCurrentAddress({
      firstName: "",
      lastName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
    })
    setIsAdding(true)
    setIsEditing(false)
    setEditIndex(null)
  }

  const handleDelete = (index: number) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCurrentAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setCurrentAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isAdding) {
      setAddresses((prev) => [...prev, currentAddress])
    } else if (isEditing && editIndex !== null) {
      setAddresses((prev) => prev.map((addr, i) => (i === editIndex ? currentAddress : addr)))
    }

    setIsAdding(false)
    setIsEditing(false)
    setEditIndex(null)
  }

  return (
    <div className="space-y-6">
      {!isAdding && !isEditing && (
        <div className="flex justify-end">
          <Button onClick={handleAdd}>Add New Address</Button>
        </div>
      )}

      {isAdding || isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{isAdding ? "Add New Address" : "Edit Address"}</CardTitle>
            <CardDescription>
              {isAdding ? "Add a new shipping address" : "Update your shipping address"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={currentAddress.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={currentAddress.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1</Label>
                <Input id="address1" name="address1" value={currentAddress.address1} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                <Input id="address2" name="address2" value={currentAddress.address2 || ""} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={currentAddress.city} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" name="state" value={currentAddress.state} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={currentAddress.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={currentAddress.country}
                    onValueChange={(value) => handleSelectChange("country", value)}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="CAN">Canada</SelectItem>
                      <SelectItem value="GBR">United Kingdom</SelectItem>
                      <SelectItem value="AUS">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={currentAddress.phone} onChange={handleChange} required />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setIsEditing(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{isAdding ? "Add Address" : "Update Address"}</Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        addresses.map((address, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>
                {address.firstName} {address.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p>{address.address1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p>{address.country}</p>
                <p className="pt-2">{address.phone}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleEdit(index)}>
                Edit
              </Button>
              <Button variant="outline" onClick={() => handleDelete(index)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
}
