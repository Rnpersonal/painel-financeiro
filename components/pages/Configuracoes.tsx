'use client'
import { toast } from '@/components/ui/Toast'

export function Configuracoes() {
  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Configurações</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Preferências do painel</p>
        </div>
        <button onClick={() => toast('Configurações salvas com sucesso!', 'sucesso')} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          Salvar alterações
        </button>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 18, marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Empresa</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Nome do painel</label>
              <input defaultValue="Painel Financeiro" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: '#fff', width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Subtítulo</label>
              <input defaultValue="Fechamento de Caixa Mensal" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: '#fff', width: '100%' }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Notificações</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>E-mail para alertas</label>
              <input type="email" defaultValue="leadleveracademy@gmail.com" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: '#fff', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#374151' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Alertar quando saídas ultrapassarem 80% das entradas
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Lembrete de fechamento mensal
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" /> Relatório semanal por e-mail
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
