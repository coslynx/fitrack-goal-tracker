export const formatDate = (date: string | Date): string => {
    if (!date) {
        return ''
    }

    try {
        const dateObj = date instanceof Date ? date : new Date(date)
        if (isNaN(dateObj.getTime())) {
            return ''
        }

        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const day = String(dateObj.getDate()).padStart(2, '0')
        return ${year}-${month}-${day}
    } catch (error: any) {
        console.error('Error formatting date:', error)
        return ''
    }
}

export const validateEmail = (email: string): boolean => {
    if (!email) {
        return false
    }

    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    } catch (error: any) {
        console.error('Error validating email:', error)
        return false
    }
}

export const sanitizeInput = (input: string): string => {
    if (!input) {
        return ''
    }

    try {
          const sanitized = String(input)
              .trim()
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;')
          return sanitized
    } catch (error: any) {
        console.error('Error sanitizing input:', error)
        return ''
    }
}