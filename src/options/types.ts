import type { EnvironmentOptions } from 'vitest/node'

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T

export type WebExtEnvironmentOptions = DeepRequired<NonNullable<EnvironmentOptions['web-ext']>>
