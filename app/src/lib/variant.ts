export const VARIANTS = [
  'baseline',
  'rename-id',
  'rename-class',
  'nest-deeper',
  'change-text',
  'change-tag',
  'all',
] as const

export type Variant = (typeof VARIANTS)[number]

const raw = import.meta.env.VITE_DOM_VARIANT ?? 'baseline'
export const variant: Variant = (VARIANTS as readonly string[]).includes(raw)
  ? (raw as Variant)
  : 'baseline'

const is = (v: Variant) => variant === v || variant === 'all'

export const renameId = is('rename-id')
export const renameClass = is('rename-class')
export const nestDeeper = is('nest-deeper')
export const changeText = is('change-text')
export const changeTag = is('change-tag')
