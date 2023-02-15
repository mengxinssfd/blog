declare module 'text-censor' {
  export function filter(value: string, cb: (_: null, value: string) => void): string;
}
