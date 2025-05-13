import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function TechnologiesUsedPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-12">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Technologies Used</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Core Technologies</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Next.js 14</strong> - React framework with App Router for server-side rendering and routing
                </li>
                <li>
                  <strong>React 18</strong> - JavaScript library for building user interfaces
                </li>
                <li>
                  <strong>TypeScript</strong> - Typed JavaScript for better developer experience and code quality
                </li>
                <li>
                  <strong>Tailwind CSS</strong> - Utility-first CSS framework for styling
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">UI Components</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>shadcn/ui</strong> - Reusable UI components built with Radix UI and Tailwind CSS
                </li>
                <li>
                  <strong>Lucide React</strong> - Beautiful open-source icons
                </li>
                <li>
                  <strong>Radix UI</strong> - Unstyled, accessible components for building high-quality design systems
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">State Management</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>React Context API</strong> - For global state management (auth, cart, favorites)
                </li>
                <li>
                  <strong>localStorage</strong> - For persisting user data between sessions
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Fetching</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Axios</strong> - Promise-based HTTP client for making API requests
                </li>
                <li>
                  <strong>React Suspense</strong> - For handling loading states
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Other Libraries</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>class-variance-authority</strong> - For creating variant components
                </li>
                <li>
                  <strong>clsx</strong> - For conditionally joining class names
                </li>
                <li>
                  <strong>next/font</strong> - For optimized font loading
                </li>
                <li>
                  <strong>next/image</strong> - For optimized image loading
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Development Tools</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>ESLint</strong> - For code linting
                </li>
                <li>
                  <strong>Prettier</strong> - For code formatting
                </li>
                <li>
                  <strong>TypeScript</strong> - For static type checking
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
