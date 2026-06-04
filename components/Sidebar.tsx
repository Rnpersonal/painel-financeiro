'use client'
import { supabase } from '@/lib/supabase'

type Page = 'dashboard' | 'lancamentos' | 'importar' | 'pendentes' | 'fechamentos' | 'categorias' | 'configuracoes'

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'lancamentos', label: 'Lançamentos', icon: '⇅' },
  { id: 'importar', label: 'Importar', icon: '↓' },
  { id: 'pendentes', label: 'Pendentes', icon: '⏱' },
  { id: 'fechamentos', label: 'Fechamentos', icon: '📅' },
  { id: 'categorias', label: 'Categorias', icon: '☰' },
  { id: 'configuracoes', label: 'Configurações', icon: '⚙' },
]

type Props = { current: Page; onChange: (p: Page) => void }

export function Sidebar({ current, onChange }: Props) {
  async function sair() {
    await supabase.auth.signOut()
  }

  return (
    <aside style={{ width: 240, minHeight: '100vh', background: '#111827', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #374151', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: '#4f46e5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>RN</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>RNpersonal</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Controle Financeiro</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => onChange(n.id)}
            onMouseEnter={e => { if (current !== n.id) { (e.currentTarget as HTMLButtonElement).style.background = '#1f2937'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' } }}
            onMouseLeave={e => { if (current !== n.id) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af' } }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
              fontSize: 13, fontWeight: 500, width: '100%', border: 'none', cursor: 'pointer',
              marginBottom: 2, transition: 'background .15s, color .15s', textAlign: 'left',
              background: current === n.id ? '#4f46e5' : 'transparent',
              color: current === n.id ? '#fff' : '#9ca3af',
            }}
          >
            <span>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid #374151' }}>
        <button
          onClick={sair}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, width: '100%', border: 'none', cursor: 'pointer', background: 'transparent', color: '#9ca3af', textAlign: 'left' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1f2937'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af' }}
        >
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sair
        </button>
      </div>
    </aside>
  )
}
