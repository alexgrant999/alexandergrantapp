'use client'
import { useEffect, useRef } from 'react'

/**
 * A confirmation shown after the page has changed under the visitor (moved, cancelled).
 * The button they pressed is gone, so focus moves here and a screen reader reads it.
 */
export function StatusNote({ message }: { message: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (message) ref.current?.focus()
  }, [message])
  return <p ref={ref} className="bk-status" role="status" tabIndex={-1}>{message}</p>
}
