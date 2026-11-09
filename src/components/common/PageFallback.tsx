import { Loader2 } from 'lucide-react'
import { Container } from '@/components/ui/Container'


//  Minimal placeholder shown while a lazily-loaded route chunk arrives.
//  Intentionally light.it only flashes on slow first visits to a page.
 
export function PageFallback() {
  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Loading page…</p>
    </Container>
  )
}
