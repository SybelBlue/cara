import daisyui from 'daisyui';
import tailwindTypography from '@tailwindcss/typography'


/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    tailwindTypography,
    daisyui,
  ],
  daisyui: {
    themes: true, // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: "darcula", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
  // https://www.reddit.com/r/sveltejs/comments/18gk1e9/anyone_else_having_issues_with_daisyui_in/
  // fix for weird issue where custom css gets optimized away
  // safelist: [
  //   { pattern: /gap./ }
  // ]
}
