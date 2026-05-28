import { useEffect, useState, type ReactNode } from 'react'
import { hasShareSignature, verifyShareLink, formatShareExpiry } from '../../uxr/shareLink'
import { readFacilitatorUnlock } from '../../uxr/urlState'

type Props = {
  path: string
  searchParams: URLSearchParams
  /** Facilitator secret-unlock bypasses expiry gate. */
  facilitatorUnlocked?: boolean
  children: ReactNode
}

type GateState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'allowed' }
  | { status: 'expired'; expiresAt: string | null }
  | { status: 'invalid' }

export function ShareLinkGate({ path, searchParams, facilitatorUnlocked = false, children }: Props) {
  const [gate, setGate] = useState<GateState>(() =>
    hasShareSignature(searchParams) ? { status: 'loading' } : { status: 'allowed' },
  )

  useEffect(() => {
    if (!hasShareSignature(searchParams)) {
      setGate({ status: 'allowed' })
      return
    }

    if (facilitatorUnlocked || readFacilitatorUnlock()) {
      setGate({ status: 'allowed' })
      return
    }

    let cancelled = false
    setGate({ status: 'loading' })

    verifyShareLink(path, searchParams)
      .then((result) => {
        if (cancelled) return
        if (result.valid) {
          setGate({ status: 'allowed' })
        } else if (result.expired) {
          setGate({ status: 'expired', expiresAt: result.expiresAt })
        } else {
          setGate({ status: 'invalid' })
        }
      })
      .catch(() => {
        if (!cancelled) setGate({ status: 'invalid' })
      })

    return () => {
      cancelled = true
    }
  }, [path, searchParams.toString(), facilitatorUnlocked])

  if (gate.status === 'allowed' || gate.status === 'idle') {
    return <>{children}</>
  }

  if (gate.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-stone-600">
        <p className="text-sm">Loading study…</p>
      </div>
    )
  }

  const expired = gate.status === 'expired'
  const expiresLine =
    expired && gate.expiresAt
      ? `This link expired on ${formatShareExpiry(gate.expiresAt)}.`
      : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 text-stone-900">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-medium text-stone-900">
          {expired ? 'This study link has expired' : 'This study link is not valid'}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
          {expiresLine ??
            'Ask your researcher for a new link if you still need access to this study.'}
        </p>
      </div>
    </div>
  )
}
