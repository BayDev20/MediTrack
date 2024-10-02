"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore'
import { db, auth } from './firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Search, Plus, BarChart2, Package, AlertTriangle, LogIn, Pill, Bandage, Stethoscope, Clipboard, Droplet, Leaf, Minus, QrCode, Moon, Sun } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { toast } from "@/components/ui/use-toast"
import { useReactToPrint } from 'react-to-print';
import { cn } from "@/lib/utils"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Switch } from "@/components/ui/switch"

// Replace the existing Supply type/interface definitions with this:
interface Supply {
  id: string;
  name: string;
  category: string;
  stock: number;
  lowStock: number | boolean;
}

const categories = [
  "All categories",
  "Meds",
  "Wound Care",
  "Topicals",
  "Environment Care",
  "Glucose Kit",
  "Misc Supplies",
  "PPE"
]

const categoryIcons = {
  "Meds": Pill,
  "Wound Care": Bandage,
  "Topicals": Droplet,
  "Environment Care": Leaf,
  "Glucose Kit": Stethoscope,
  "Misc Supplies": Package,
  "PPE": Clipboard,
  // Add more icons as needed
}

// Add this new component before your main Home component
const ThemeToggle = ({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) => {
  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
      />
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </div>
  )
}

export default function Home() {
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [user, loading] = useAuthState(auth)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All categories")
  const [scannedItem, setScannedItem] = useState("")
  const [scanMode, setScanMode] = useState<"in" | "out">("in")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [isAddingSupply, setIsAddingSupply] = useState(false)
  const [newSupplyName, setNewSupplyName] = useState("")
  const [newSupplyCategory, setNewSupplyCategory] = useState("")
  const [newSupplyStock, setNewSupplyStock] = useState("")
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showOrderList, setShowOrderList] = useState(false)
  const orderListRef = useRef(null)

  useEffect(() => {
    if (loading) return
    if (!user) router.push('/login')
    else fetchSupplies()
  }, [user, loading, router])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const fetchSupplies = async () => {
    try {
      const suppliesCollection = collection(db, 'supplies')
      const suppliesSnapshot = await getDocs(suppliesCollection)
      const suppliesList = suppliesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Supply[]
      setSupplies(suppliesList.map(item => ({
        ...item,
        lowStock: item.stock <= (typeof item.lowStock === 'number' ? item.lowStock : 100)
      })))
    } catch (err) {
      console.error("Error fetching supplies:", err)
      setError("Failed to load supplies. Please try again later.")
    }
  }

  const addSupply = async (name: string, category: string, stock: number) => {
    try {
      await addDoc(collection(db, 'supplies'), {
        name,
        category,
        stock: stock,
        lowStock: stock < 100
      })
      toast({
        title: "Supply Added",
        description: `${name} has been added to the inventory.`,
      })
      fetchSupplies() // Refresh the list
    } catch (err) {
      console.error("Error adding supply:", err)
      toast({
        title: "Error",
        description: "Failed to add supply. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateSupply = async (id: string, updatedData: Partial<Supply>) => {
    try {
      const supplyRef = doc(db, 'supplies', id)
      await updateDoc(supplyRef, updatedData)
      toast({
        title: "Supply Updated",
        description: `The supply has been updated.`,
      })
      fetchSupplies() // Refresh the list
    } catch (err) {
      console.error("Error updating supply:", err)
      toast({
        title: "Error",
        description: "Failed to update supply. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteSupply = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'supplies', id))
      toast({
        title: "Supply Deleted",
        description: `The supply has been removed from the inventory.`,
      })
      fetchSupplies() // Refresh the list
    } catch (err) {
      console.error("Error deleting supply:", err)
      toast({
        title: "Error",
        description: "Failed to delete supply. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredSupplies = supplies.filter(supply => 
    supply.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "All categories" || supply.category === selectedCategory)
  )

  const totalStock = supplies.reduce((sum, supply) => sum + supply.stock, 0)
  const lowStockCount = supplies.filter(supply => supply.lowStock).length

  const handleScan = async () => {
    const suppliesCollection = collection(db, 'supplies')
    const q = query(suppliesCollection, where("name", "==", scannedItem))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const item = querySnapshot.docs[0]
      const itemData = item.data()
      const newStock = scanMode === "in" ? itemData.stock + 1 : Math.max(0, itemData.stock - 1)
      
      await updateSupply(item.id, { 
        stock: newStock,
        lowStock: newStock < 100 // Example threshold
      })

      toast({
        title: `Item Scanned ${scanMode === "in" ? "In" : "Out"}`,
        description: `${scanMode === "in" ? "Added" : "Removed"} 1 ${itemData.name} ${scanMode === "in" ? "to" : "from"} inventory. New stock: ${newStock}`,
      })
    } else {
      toast({
        title: "Error",
        description: "Item not found in inventory.",
        variant: "destructive",
      })
    }
    setScannedItem("")
  }

  // Function to handle user logout
  const handleLogout = () => {
    auth.signOut()
    router.push('/login')
    toast({
      title: "Logged Out",
      description: "You have been logged out.",
    })
  }

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  // Setup for printing the order list
  const handlePrint = useReactToPrint({
    documentTitle: orderListRef.current || 'Order List',
  });

  // Sort supplies by category and then by name
  const sortedSupplies = [...filteredSupplies].sort((a, b) => {
    // First, sort by category
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    
    // If categories are the same, sort by name
    return a.name.localeCompare(b.name);
  });

  // Show loading state while authentication is in progress
  if (loading) {
    return <div>Loading...</div>
  }

  // Return null if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 p-4 border-r dark:border-gray-700 flex flex-col">
        {/* App logo and title */}
        <div className="flex items-center space-x-2 mb-6">
          <Package className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold dark:text-white">MedStock</h2>
        </div>
        {/* Navigation menu */}
        <nav className="space-y-2 flex-grow">
          <Button className="w-full justify-start ghost">
            <BarChart2 className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button className="w-full justify-start bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <Package className="mr-2 h-4 w-4" />
            Inventory
          </Button>
          <Button className="w-full justify-start" onClick={() => setShowOrderList(true)}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Order List
          </Button>
        </nav>
        {/* Scrollable area for additional content */}
        <ScrollArea className="flex-1">
          <div className="space-y-4 pr-4">
            {/* Total Stock Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStock}</div>
                <p className="text-xs text-muted-foreground">items in inventory</p>
              </CardContent>
            </Card>
            {/* Low Stock Items Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground">items need reordering</p>
              </CardContent>
            </Card>
            {/* Scan Item Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scan Item</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="Scan or enter item name"
                  value={scannedItem}
                  onChange={(e) => setScannedItem(e.target.value)}
                />
                <Select value={scanMode} onValueChange={(value) => setScanMode(value as "in" | "out")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Scan mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Scan In</SelectItem>
                    <SelectItem value="out">Scan Out</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleScan} className="w-full">Scan</Button>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        {/* Made by Cody Beggs footer */}
        <div className="mt-auto pt-4 pb-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-end space-x-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Crafted with</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-500 dark:text-gray-400">by</span>
            <a 
              href="https://github.com/codybeggs" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-80 transition-opacity"
            >
              Cody Beggs
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold dark:text-white">Inventory</h1>
            <div className="flex items-center space-x-4">
              {/* Theme toggle switch */}
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              {/* Logout button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className={cn(theme === 'dark' && "text-white border-white hover:bg-white hover:text-gray-800")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <ScrollArea className="flex-1">
          <main className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {/* Header for Supplies section */}
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight dark:text-white">Supplies</h2>
                <p className="text-sm text-muted-foreground dark:text-gray-300">Manage your urgent care inventory</p>
              </div>
              {/* Search, category filter, and add supply button */}
              <div className="flex items-center space-x-2">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search supplies..."
                    className="pl-8 w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {/* Category filter dropdown */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className={cn("w-[180px]", theme === 'dark' && "text-white")}>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className={theme === 'dark' ? "text-white" : ""}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Add supply button */}
                <Button onClick={() => setIsAddingSupply(!isAddingSupply)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Supply
                </Button>
              </div>
            </div>

            {/* Add new supply form */}
            {isAddingSupply && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Add New Supply</h3>
                {/* Supply name input */}
                <Input
                  placeholder="Supply Name"
                  value={newSupplyName}
                  onChange={(e) => setNewSupplyName(e.target.value)}
                  className={cn("mb-2", theme === 'dark' && "border border-gray-600")}
                />
                {/* Supply category dropdown */}
                <Select 
                  value={newSupplyCategory} 
                  onValueChange={setNewSupplyCategory}
                >
                  <SelectTrigger className={cn("mb-2", theme === 'dark' && "border border-gray-600 text-white")}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category} className={theme === 'dark' ? "text-white" : ""}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Initial stock input */}
                <Input
                  type="number"
                  placeholder="Initial Stock"
                  value={newSupplyStock}
                  onChange={(e) => setNewSupplyStock(e.target.value)}
                  className={cn("mb-2", theme === 'dark' && "border border-gray-600")}
                />
                {/* Add supply button */}
                <Button onClick={() => {
                  if (newSupplyName && newSupplyCategory && newSupplyStock) {
                    addSupply(newSupplyName, newSupplyCategory, parseInt(newSupplyStock))
                    setIsAddingSupply(false)
                    setNewSupplyName("")
                    setNewSupplyCategory("")
                    setNewSupplyStock("")
                  } else {
                    toast({
                      title: "Error",
                      description: "Please fill in all fields.",
                      variant: "destructive",
                    })
                  }
                }}>
                  Add Supply
                </Button>
              </div>
            )}

            {/* Supply list */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {/* Supply list header */}
              <div className="grid grid-cols-5 gap-4 p-4 font-medium text-muted-foreground border-b dark:border-gray-700 dark:text-gray-300">
                <div>Category</div>
                <div>Name</div>
                <div>Stock</div>
                <div>Actions</div>
                <div></div>
              </div>
              {/* Supply list items */}
              {sortedSupplies.map((supply, index) => {
                const CategoryIcon = categoryIcons[supply.category as keyof typeof categoryIcons] || Package
                return (
                  <div key={supply.id} className={cn(
                    "grid grid-cols-5 gap-4 p-4 items-center",
                    index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
                  )}>
                    {/* Supply category */}
                    <div className="flex items-center space-x-2 text-muted-foreground dark:text-gray-300">
                      <CategoryIcon className="h-5 w-5" />
                      <span>{supply.category}</span>
                    </div>
                    {/* Supply name */}
                    <div className="font-medium dark:text-white">{supply.name}</div>
                    {/* Supply stock */}
                    <div>
                      <Badge variant={supply.lowStock ? "destructive" : "secondary"}>
                        {supply.stock} in stock
                      </Badge>
                    </div>
                    {/* Stock adjustment buttons */}
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateSupply(supply.id, { stock: supply.stock - 1 })}
                        className={theme === 'dark' ? "text-white border-white" : ""}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className={cn("w-8 text-center", theme === 'dark' && "text-white")}>{supply.stock}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateSupply(supply.id, { stock: supply.stock + 1 })}
                        className={theme === 'dark' ? "text-white border-white" : ""}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Delete supply button */}
                    <div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteSupply(supply.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order List Modal */}
            {showOrderList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div ref={orderListRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full">
                  <h2 className="text-2xl font-bold mb-4 dark:text-white">Order List</h2>
                  {/* List of low stock items */}
                  <div className="mb-4">
                    {sortedSupplies.filter(supply => supply.lowStock).map((supply) => (
                      <div key={supply.id} className="flex justify-between items-center mb-2 dark:text-gray-300">
                        <span>{supply.name} ({supply.category})</span>
                        <span>{supply.stock} in stock</span>
                      </div>
                    ))}
                  </div>
                  {/* Modal action buttons */}
                  <div className="flex justify-end space-x-2">
                    <Button onClick={() => setShowOrderList(false)}>Close</Button>
                    <Button onClick={() => handlePrint()}>Print</Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}