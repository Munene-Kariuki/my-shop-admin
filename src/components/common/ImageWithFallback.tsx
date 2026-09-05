import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageWithFallbackProps {
  src?: string
  alt: string
  className?: string
}

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)
  const [trackedSrc, setTrackedSrc] = useState(src)

  // Reset the failed flag when a new src comes in (e.g. a different row's
  // image, or a saved edit) — adjusting state during render rather than in
  // an effect, per React's guidance for resetting state on prop change.
  if (src !== trackedSrc) {
    setTrackedSrc(src)
    setFailed(false)
  }

  if (!src || failed) {
    return (
      <div
        className={cn('flex items-center justify-center bg-muted text-muted-foreground', className)}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="size-4" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img src={src} alt={alt} className={cn('object-cover', className)} onError={() => setFailed(true)} />
  )
}
