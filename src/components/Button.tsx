import React from 'react'

interface ButtonProps {
    onClick: React.MouseEventHandler<HTMLButtonElement>
    children: React.ReactNode
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    className?: string
}

const Button: React.FC<ButtonProps> = ({
    onClick,
    children,
    type = 'button',
    disabled = false,
    className = '',
}) => {
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        if (disabled) {
            event.preventDefault()
            return
        }
        if (onClick) {
          onClick(event)
        }
    }

    const defaultClasses =
        'bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 disabled:cursor-not-allowed'

    const combinedClasses = ${defaultClasses} ${className}.trim()

    return (
        <button
            onClick={handleClick}
            className={combinedClasses}
            type={type}
            disabled={disabled}
        >
            {children}
        </button>
    )
}

export default Button