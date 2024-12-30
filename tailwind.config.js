/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
    /**
     * An array of file paths to scan for Tailwind CSS class names.
     * @type {string[]}
     */
    content: [
        './src/**/*.{js,jsx,ts,tsx}',
        './public/index.html',
    ],
    /**
     * Configuration for extending the default Tailwind CSS theme.
     * @type {object}
     */
    theme: {
        /**
         * Extends the default theme configuration
         * @type {object}
         */
        extend: {
            /**
             * Defines custom color palettes for the application.
             * @type {object}
             */
            colors: {
                /**
                 * The primary color of the application.
                 * @type {string}
                 */
                primary: '#3490dc',
                /**
                 * The secondary color of the application.
                 * @type {string}
                 */
                secondary: '#ffed4a',
            },
            /**
             * Defines custom font families for the application.
             * @type {object}
             */
            fontFamily: {
                /**
                 * The sans-serif font family.
                 * @type {string[]}
                 */
                sans: ['Graphik', 'sans-serif'],
                /**
                 * The serif font family.
                 * @type {string[]}
                 */
                serif: ['Merriweather', 'serif'],
            },
        },
        /**
          * Custom breakpoint configuration for responsive designs
          * @type {object}
          */
        screens: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
        },
    },
    /**
     * An array of plugins to extend Tailwind CSS functionality
     * @type {Array}
     */
    plugins: [],
}