// The dashboard's own palette. Secondary text is #c8c8d8 rather than #6b6b8a, which reads at 3.5 to 1 on these panels;
// #6b6b8a stays for control borders, where 3 to 1 is the bar. The filled button uses the darker purple so white text clears 4.5 to 1.
const BUTTON =
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b85ff] disabled:cursor-progress disabled:opacity-60'

export const PRIMARY = `${BUTTON} bg-[#5a52e0] text-white hover:bg-[#5a52e0]/80`
export const GHOST = `${BUTTON} bg-[#1e1e2e] text-[#e8e8f0] hover:bg-[#252535]`
export const DANGER = `${BUTTON} bg-red-500/10 text-red-400 hover:bg-red-500/20`
export const QUIET = `${BUTTON} px-2 text-[#8b85ff] underline underline-offset-4 hover:text-[#e8e8f0]`

export const INPUT =
  'min-h-11 rounded-lg border border-[#6b6b8a] bg-[#13131a] px-3 text-sm text-[#e8e8f0] outline-none [color-scheme:dark] focus:border-[#8b85ff] focus-visible:ring-2 focus-visible:ring-[#8b85ff]/40'

export const PANEL = 'bg-[#16161f] border border-[#1e1e2e] rounded-2xl'
export const SECTION_LABEL = 'text-sm font-medium text-[#c8c8d8] uppercase tracking-wider'
