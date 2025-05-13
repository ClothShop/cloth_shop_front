"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  totalPages: number
  currentPage: number
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", pageNumber.toString())
    return `?${params.toString()}`
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show a subset of pages with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1)
        pages.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Middle
        pages.push(1)
        pages.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className="mx-auto mt-8 flex w-full items-center justify-center space-x-2">
      <PaginationPrevious href={createPageURL(currentPage - 1)} disabled={currentPage <= 1} />
      {pageNumbers.map((page, index) =>
        page === "ellipsis" ? (
          <PaginationEllipsis key={`ellipsis-${index}`} />
        ) : (
          <PaginationItem
            key={`page-${page}`}
            active={currentPage === page}
            href={createPageURL(page as number)}
            page={page}
          />
        ),
      )}
      <PaginationNext href={createPageURL(currentPage + 1)} disabled={currentPage >= totalPages} />
    </nav>
  )
}

interface PaginationItemProps {
  active: boolean
  href: string
  page: string | number
}

export function PaginationItem({ active, href, page }: PaginationItemProps) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="icon"
      asChild={!active}
      className={cn("h-8 w-8", active && "pointer-events-none")}
    >
      {!active ? <Link href={href}>{page}</Link> : <span>{page}</span>}
    </Button>
  )
}

export function PaginationEllipsis() {
  return <span className="px-2">...</span>
}

interface PaginationPreviousProps {
  href: string
  disabled: boolean
}

export function PaginationPrevious({ href, disabled }: PaginationPreviousProps) {
  return (
    <Button variant="outline" size="icon" asChild disabled={disabled}>
      <Link href={href}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Link>
    </Button>
  )
}

interface PaginationNextProps {
  href: string
  disabled: boolean
}

export function PaginationNext({ href, disabled }: PaginationNextProps) {
  return (
    <Button variant="outline" size="icon" asChild disabled={disabled}>
      <Link href={href}>
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Link>
    </Button>
  )
}

export const PaginationContent = () => null
export const PaginationLink = () => null
