import React from 'react'

interface InputProps {
    type?: string
    placeholder?: string
    value?: string
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    className?: string
    required?: boolean
    error?: string
}

const Input: React.FC<InputProps> = ({
    type = 'text',
    placeholder = '',
    value = '',
    onChange,
    className = '',
    required = false,
    error,
}) => {
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        if (onChange) {
            onChange(event)
        }
    }

    const baseClasses = 'border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline'
    const errorClasses = error ? 'border-red-500 focus:border-red-500' : ''
    const combinedClasses = ${baseClasses} ${errorClasses} ${className}.trim()

    const errorId = error ? input-error-${placeholder?.replace(/\s/g, '-')} : undefined

    return (
        <div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                className={combinedClasses}
                required={required}
                aria-describedby={error ? errorId : undefined}
            />
            {error && (
                <p id={errorId} className="text-red-500 text-xs italic">
                    {error}
                </p>
            )}
        </div>
    )
}

export default Input