'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

export function AdminFooter() {
    return (
        <footer className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#2a241c] border-t border-gray-200 dark:border-[#3a342a] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 sticky bottom-0 shrink-0 w-full">
            <div className="text-xs text-gray-500 font-medium">
                © 2024 Bakery Admin. <span className="hidden sm:inline">v1.0.0</span>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-xs text-gray-500 hover:text-primary">
                    Help
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold px-6 rounded-lg shadow-md hover:shadow-lg transition-all">
                    Save Changes
                </Button>
            </div>
        </footer>
    )
}
