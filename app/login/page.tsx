"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, UserPlus, Package } from 'lucide-react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from '../firebase'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase'  // Make sure you're importing db

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [site, setSite] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Starting auth process")
    if (!site) {
      toast({
        title: "Error",
        description: "Please select a site.",
        variant: "destructive",
      })
      return
    }
    console.log("Site selected:", site)
    try {
      let userCredential;
      if (isLogin) {
        console.log("Attempting login")
        userCredential = await signInWithEmailAndPassword(auth, email, password)
        
        // Check if the user's site matches the selected site
        const user = userCredential.user
        const userDoc = await getDoc(doc(db, "users", user.uid))
        const userData = userDoc.data()
        
        if (userData && userData.site !== site) {
          // Site doesn't match, show error and prevent login
          console.log("Site mismatch detected")
          await auth.signOut() // Sign out the user
          toast({
            title: "Login Failed",
            description: "The selected site doesn't match your assigned site. Please choose the correct site.",
            variant: "destructive",
          })
          // Fallback alert for debugging
          alert("The selected site doesn't match your assigned site. Please choose the correct site.")
          return // Exit the function early
        }
      } else {
        console.log("Attempting signup")
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        console.log("User created, creating Firestore document")
        // Create a user document in Firestore
        const user = userCredential.user
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          site: site
        })
        console.log("Firestore document created")
      }
      
      const user = userCredential.user
      console.log("Updating user profile")
      // Update the user profile with the selected site
      await updateProfile(user, { displayName: site })
      console.log("User profile updated")
      
      toast({
        title: isLogin ? "Login Successful" : "Sign Up Successful",
        description: `Welcome ${isLogin ? 'back ' : ''}to MedStock!`,
      })
      console.log("Redirecting to home page")
      router.push('/') // Redirect to home page
    } catch (error) {
      console.error("Auth error:", error)
      toast({
        title: isLogin ? "Login Failed" : "Sign Up Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleAuthMode = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    setIsLogin(!isLogin)
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-2xl font-bold">MedStock</CardTitle>
          </div>
          <CardDescription>
            {isLogin ? "Enter your details to access your account" : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site">Site</Label>
              <Select value={site} onValueChange={setSite} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OAK4">OAK4</SelectItem>
                  <SelectItem value="SCK6">SCK6</SelectItem>
                  {/* Add more site options as needed */}
                </SelectContent>
              </Select>
            </div>
            {isLogin && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Remember me
                </Label>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">
              {isLogin ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </>
              )}
            </Button>
            <div className="text-sm text-center text-gray-500 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={toggleAuthMode}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}