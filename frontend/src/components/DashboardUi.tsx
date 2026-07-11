import type { PropsWithChildren } from 'react'

export function Topbar({ search }: { search?: string }) {
  return <header className="topbar">
    {search ? <div className="search">⌕ <span>{search}</span></div> : <div />}
    <div className="top-actions"><button>◉</button><button>♧</button><span className="avatar">SA</span></div>
  </header>
}

export function Card({ title, children, className = '' }: PropsWithChildren<{ title?: string; className?: string }>) {
  return <section className={`card ${className}`}>{title && <h2>{title}</h2>}{children}</section>
}

export function Metric({ label, value, note, accent = 'blue' }: { label: string; value: string; note?: string; accent?: 'blue' | 'red' | 'green' }) {
  return <Card className={`metric ${accent}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}<i /></Card>
}

