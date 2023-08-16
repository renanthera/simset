/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'woodsmoke': {
          '50': '#f5f6f6',
          '100': '#e4e8e9',
          '200': '#cdd4d4',
          '300': '#aab4b6',
          '400': '#7f8e91',
          '500': '#647276',
          '600': '#556165',
          '700': '#495155',
          '800': '#414749',
          '900': '#393e40',
          '950': '#141617',
      },
      'bittersweet': {
          '50': '#fff1f1',
          '100': '#ffe1e1',
          '200': '#ffc7c7',
          '300': '#ffa0a0',
          '400': '#ff5e5e',
          '500': '#f83b3b',
          '600': '#e51d1d',
          '700': '#c11414',
          '800': '#a01414',
          '900': '#841818',
          '950': '#480707',
      },
      'lavender': {
          '50': '#fcf5fe',
          '100': '#f8ebfc',
          '200': '#f2d6f8',
          '300': '#e9b5f2',
          '400': '#dc89e9',
          '500': '#d070df',
          '600': '#ae3bbe',
          '700': '#922e9d',
          '800': '#7a2781',
          '900': '#66256a',
          '950': '#420d45',
      },
      'medium-purple': {
          '50': '#f0f2fd',
          '100': '#e4e6fb',
          '200': '#ced1f7',
          '300': '#afb4f2',
          '400': '#908fea',
          '500': '#796fdf',
          '600': '#6d59d2',
          '700': '#5e49b9',
          '800': '#4d3e95',
          '900': '#413877',
          '950': '#272145',
      },
      'viking': {
          '50': '#f2f9fd',
          '100': '#e5f1f9',
          '200': '#c5e3f2',
          '300': '#91cce8',
          '400': '#6fbcdf',
          '500': '#3197c6',
          '600': '#2179a8',
          '700': '#1c6188',
          '800': '#1b5371',
          '900': '#1c465e',
          '950': '#122d3f',
      },
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
        'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ],
}
