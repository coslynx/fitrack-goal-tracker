import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    const baseClasses = 'bg-white rounded-lg p-4 shadow-md'
    const combinedClasses = ${baseClasses} ${className}.trim()

    return <div className={combinedClasses}>{children}</div>
}

export default Card