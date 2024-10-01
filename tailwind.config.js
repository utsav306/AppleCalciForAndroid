/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#1DA1F2", // Example of adding a custom color
        secondary: "#14171A", // Another custom color
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'], // Custom font family
      },
      spacing: {
        '128': '32rem', // Custom spacing value
      },
    },
  },
  plugins: [],
};
