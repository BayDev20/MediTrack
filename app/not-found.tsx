"use client"

import { useRouter } from 'next/navigation'
import { Package, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Package className="h-16 w-16 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2 dark:text-white">404</h1>
        <h2 className="text-2xl font-semibold mb-4 dark:text-gray-300">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button 
          onClick={() => router.push('/')}
          className="inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back Home
        </Button>
      </div>
    </div>
  )
}
