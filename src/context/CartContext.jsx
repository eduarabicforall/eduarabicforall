import React, { createContext, useContext, useState, useEffect } from 'react'
import { PRODUCTS } from '../data/products'

const CartContext = createContext(null)

const STORAGE_KEY = 'ea-cart'

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (productId) => {
    setItems(prev => prev.includes(productId) ? prev : [...prev, productId])
  }

  const removeItem = (productId) => {
    setItems(prev => prev.filter(id => id !== productId))
  }

  const clearCart = () => setItems([])

  const cartProducts = items.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean)
  const total = cartProducts.reduce((sum, p) => sum + p.price, 0)
  const count = items.length

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, cartProducts, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
