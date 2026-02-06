import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    productId: string
    variantId?: string
    name: string
    variantName?: string
    price: number
    quantity: number
    image: string
}

interface CartStore {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    getTotalItems: () => number
    getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => set((state) => {
                const existingItem = state.items.find(
                    item => item.productId === newItem.productId && item.variantId === newItem.variantId
                )
                if (existingItem) {
                    return {
                        items: state.items.map(item =>
                            item.productId === newItem.productId && item.variantId === newItem.variantId
                                ? { ...item, quantity: item.quantity + newItem.quantity }
                                : item
                        )
                    }
                }
                return { items: [...state.items, { ...newItem, id: newItem.id || Math.random().toString(36).substr(2, 9) }] }
            }),
            removeItem: (id) => set((state) => ({
                items: state.items.filter(item => item.id !== id)
            })),
            updateQuantity: (id, quantity) => set((state) => ({
                items: state.items.map(item =>
                    item.id === id ? { ...item, quantity } : item
                )
            })),
            clearCart: () => set({ items: [] }),
            getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
            getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
        }),
        {
            name: 'bakery-cart-storage',
        }
    )
)
