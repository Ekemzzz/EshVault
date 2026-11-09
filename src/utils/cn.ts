// 
//   Minimal class-name combiner. Accepts strings / falsy values and joins them.  
// 
export type ClassValue = string | number | null | undefined | false

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).map(String).join(' ')
}
