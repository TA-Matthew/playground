import { useEffect, useRef, useState } from 'react'

/**
 * Dev-only helper. Hold Option (Alt) and:
 *  - hover  -> highlight the element + show its component name and source location
 *  - click  -> copy "src/path/File.tsx:line" to the clipboard (+ toast)
 *
 * Relies on React's JSX dev transform (__source / _debugSource), which
 * @vitejs/plugin-react enables automatically in development.
 */

type SourceInfo = {
  fileName: string
  lineNumber: number
  columnNumber?: number
  componentName?: string
}

const FIBER_PREFIX = '__reactFiber$'

function getFiber(node: Element | null): any {
  if (!node) return null
  const key = Object.keys(node).find((k) => k.startsWith(FIBER_PREFIX))
  return key ? (node as any)[key] : null
}

function nameFromType(type: unknown): string | undefined {
  if (typeof type === 'string') return type
  if (typeof type === 'function') {
    const fn = type as { displayName?: string; name?: string }
    return fn.displayName || fn.name || undefined
  }
  return undefined
}

function relativePath(fileName: string): string {
  const idx = fileName.lastIndexOf('/src/')
  return idx >= 0 ? fileName.slice(idx + 1) : fileName
}

function findSource(node: Element | null): SourceInfo | null {
  let fiber = getFiber(node)
  while (fiber) {
    const src = fiber._debugSource
    if (src && src.fileName) {
      // Prefer the name of the component that authored this element.
      const owner = fiber._debugOwner
      const componentName =
        nameFromType(owner?.type) ?? nameFromType(fiber.type)
      return {
        fileName: src.fileName,
        lineNumber: src.lineNumber,
        columnNumber: src.columnNumber,
        componentName,
      }
    }
    fiber = fiber.return
  }
  return null
}

export function ClickToCopySource() {
  const [active, setActive] = useState(false) // Option held
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [info, setInfo] = useState<SourceInfo | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) setActive(true)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) {
        setActive(false)
        setRect(null)
        setInfo(null)
      }
    }
    const onBlur = () => {
      setActive(false)
      setRect(null)
      setInfo(null)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  useEffect(() => {
    if (!active) return

    const onMove = (e: MouseEvent) => {
      const el = e.target as Element | null
      if (!el || !(el instanceof Element)) return
      setRect(el.getBoundingClientRect())
      setInfo(findSource(el))
    }

    const onClick = (e: MouseEvent) => {
      if (!e.altKey) return
      const el = e.target as Element | null
      const src = findSource(el)
      if (!src) return
      e.preventDefault()
      e.stopPropagation()
      const rel = relativePath(src.fileName)
      const text = `${rel}:${src.lineNumber}`
      navigator.clipboard?.writeText(text).then(
        () => showToast(`Copied  ${text}`),
        () => showToast(`Could not copy (${text})`),
      )
    }

    window.addEventListener('mousemove', onMove, true)
    window.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('mousemove', onMove, true)
      window.removeEventListener('click', onClick, true)
    }
  }, [active])

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2000)
  }

  return (
    <>
      {active && rect && (
        <div
          style={{
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            border: '1px solid #4f8cff',
            background: 'rgba(79,140,255,0.12)',
            borderRadius: 2,
            pointerEvents: 'none',
            zIndex: 2147483646,
          }}
        >
          {info && (
            <div
              style={{
                position: 'absolute',
                top: -22,
                left: 0,
                whiteSpace: 'nowrap',
                font: '11px/16px ui-monospace, monospace',
                background: '#1e293b',
                color: '#fff',
                padding: '1px 6px',
                borderRadius: 3,
              }}
            >
              {info.componentName ? `<${info.componentName}> ` : ''}
              {relativePath(info.fileName)}:{info.lineNumber}
            </div>
          )}
        </div>
      )}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            font: '13px/1 ui-monospace, monospace',
            background: '#16a34a',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 6,
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
            zIndex: 2147483647,
          }}
        >
          {toast}
        </div>
      )}
    </>
  )
}
