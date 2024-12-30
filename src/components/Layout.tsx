import React, { ReactNode } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface LayoutProps {
    children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <React.StrictMode>
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
        </div>
      </React.StrictMode>
    )
}

export default Layout