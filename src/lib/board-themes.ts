
export interface BoardTheme {
  id: string;
  name: string;
  light: string;
  dark: string;
}

export const boardThemes: BoardTheme[] = [
  { id: 'default', name: 'Amber', light: 'bg-amber-200', dark: 'bg-amber-600' },
  { id: 'green', name: 'Green', light: 'bg-emerald-200', dark: 'bg-emerald-600' },
  { id: 'blue', name: 'Blue', light: 'bg-sky-200', dark: 'bg-sky-600' },
  { id: 'walnut', name: 'Walnut', light: 'bg-yellow-200', dark: 'bg-yellow-700' },
  { id: 'stone', name: 'Stone', light: 'bg-slate-300', dark: 'bg-slate-500' },
  { id: 'rose', name: 'Rose', light: 'bg-rose-200', dark: 'bg-rose-500' },
  { id: 'sand', name: 'Sand', light: 'bg-orange-100', dark: 'bg-orange-300' },
  { id: 'forest', name: 'Forest', light: 'bg-lime-300', dark: 'bg-green-800' },
  { id: 'ice', name: 'Ice', light: 'bg-cyan-200', dark: 'bg-blue-800' },
  { id: 'cherry', name: 'Cherry', light: 'bg-red-200', dark: 'bg-red-700' },
  { id: 'classic', name: 'Classic', light: 'bg-gray-100', dark: 'bg-gray-400' },
  { id: 'ocean', name: 'Ocean', light: 'bg-teal-100', dark: 'bg-teal-500' },
  { id: 'bubblegum', name: 'Bubblegum', light: 'bg-pink-200', dark: 'bg-pink-400' },
  { id: 'lavender', name: 'Lavender', light: 'bg-violet-200', dark: 'bg-violet-500' },
  { id: 'mint', name: 'Mint', light: 'bg-green-200', dark: 'bg-teal-700' },
  { id: 'sunflower', name: 'Sunflower', light: 'bg-yellow-100', dark: 'bg-yellow-500' },
  { id: 'twilight', name: 'Twilight', light: 'bg-indigo-200', dark: 'bg-indigo-500' },
  { id: 'coral', name: 'Coral', light: 'bg-orange-200', dark: 'bg-red-400' },
  { id: 'sky', name: 'Sky', light: 'bg-blue-100', dark: 'bg-blue-400' },
  { id: 'graphite', name: 'Graphite', light: 'bg-slate-200', dark: 'bg-slate-700' },
];

// This is a safelist for Tailwind CSS to ensure the classes are not purged.
// It is extracted from the boardThemes array.
// bg-amber-200 bg-amber-600 bg-emerald-200 bg-emerald-600 bg-sky-200 bg-sky-600
// bg-yellow-200 bg-yellow-700 bg-slate-300 bg-slate-500 bg-rose-200 bg-rose-500
// bg-orange-100 bg-orange-300 bg-lime-300 bg-green-800 bg-cyan-200 bg-blue-800
// bg-red-200 bg-red-700
// bg-gray-100 bg-gray-400 bg-teal-100 bg-teal-500 bg-pink-200 bg-pink-400
// bg-violet-200 bg-violet-500 bg-green-200 bg-teal-700 bg-yellow-100 bg-yellow-500
// bg-indigo-200 bg-indigo-500 bg-orange-200 bg-red-400 bg-blue-100 bg-blue-400
// bg-slate-200 bg-slate-700
