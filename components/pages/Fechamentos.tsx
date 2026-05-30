'use client'
import { useEffect, useState } from 'react'
import { supabase, type Lancamento, type Fechamento } from '@/lib/supabase'
import { fmt, MESES, MESES_OPTIONS } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'

export function Fechamentos() {
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([])
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVer, setModalVer] = useState<{ mes: string; e: number; s: number } | null>(null)
  const [modalFechar, setModalFechar] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const [{ data: f }, { data: l }] = await Promise.all([
      supabase.from('fechamentos').select('*').order('mes', { ascending: false }),
      supabase.from('lancamentos').select('id, mes, tipo, valor, descricao, categoria, data'),
    ])
    setFechamentos(f || [])
    setLancamentos(l || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function getTotais(mes: string) {
    const ls = lancamentos.filter(l => l.mes === mes)
    const e = ls.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
    const s = ls.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
    return { e, s }
  }

  async function fecharMes(mes: string) {
    const existing = fechamentos.find(f => f.mes === mes)
    if (existing) {
      await supabase.from('fechamentos').update({ status: 'fechado' }).eq('id', existing.id)
    } else {
      await supabase.from('fechamentos').insert({ mes, status: 'fechado' })
    }
    toast(`${MESES[mes] || mes} fechado com sucesso!`, 'sucesso')
    setModalFechar(null)
    load()
  }

  const allMeses = MESES_OPTIONS.map(o => o.value)
  const fechadosSet = new Set(fechamentos.filter(f => f.status === 'fechado').map(f => f.mes))

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Fechamentos</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Resumo mensal de caixa</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Mês', 'Entradas', 'Saídas', 'Resultado', 'Margem', 'Status', 'Ações'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Carregando...</td></tr>
            ) : allMeses.map(mes => {
              const { e, s } = getTotais(mes)
              const res = e - s
              const mrg = e > 0 ? ((res / e) * 100).toFixed(1) : '—'
              const fechado = fechadosSet.has(mes)
              const temDados = e > 0 || s > 0
              return (
                <tr key={mes}>
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: '#111827', fontWeight: 600 }}>{MESES[mes]}</td>
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: temDados ? '#059669' : '#9ca3af', fontWeight: temDados ? 700 : 400 }}>{temDados ? fmt(e) : '—'}</td>
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: temDados ? '#dc2626' : '#9ca3af', fontWeight: temDados ? 700 : 400 }}>{temDados ? fmt(s) : '—'}</td>
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: temDados ? (res >= 0 ? '#059669' : '#dc2626') : '#9ca3af', fontWeight: temDados ? 700 : 400 }}>{temDados ? fmt(res) : '—'}</td>
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: '#374151' }}>{temDados ? `${mrg}%` : '—'}</td>
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                    {fechado ? (
                      <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>✓ Fechado</span>
                    ) : temDados ? (
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>Em aberto</span>
                    ) : (
                      <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>Aguardando</span>
                    )}
                  </td>
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', display: 'flex', gap: 6 }}>
                    {temDados && (
                      <button onClick={() => setModalVer({ mes, e, s })} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Ver</button>
                    )}
                    {temDados && !fechado && (
                      <button onClick={() => setModalFechar(mes)} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Fechar mês</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal title={`Fechamento — ${modalVer ? MESES[modalVer.mes] : ''}`} open={!!modalVer} onClose={() => setModalVer(null)}
        footer={<button onClick={() => setModalVer(null)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Fechar</button>}
      >
        {modalVer && (() => {
          const res = modalVer.e - modalVer.s
          const mrg = modalVer.e > 0 ? ((res / modalVer.e) * 100).toFixed(1) : '0.0'
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'ENTRADAS', value: fmt(modalVer.e), bg: '#f0fdf4', border: '#10b981', val: '#065f46' },
                { label: 'SAÍDAS', value: fmt(modalVer.s), bg: '#fef2f2', border: '#ef4444', val: '#991b1b' },
                { label: 'RESULTADO', value: fmt(res), bg: '#eff6ff', border: '#3b82f6', val: '#1e40af' },
                { label: 'MARGEM', value: `${mrg}%`, bg: '#f0fdf4', border: '#10b981', val: '#065f46' },
              ].map(c => (
                <div key={c.label} style={{ background: c.bg, borderRadius: 10, padding: 14, borderLeft: `3px solid ${c.border}` }}>
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{c.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c.val, marginTop: 4 }}>{c.value}</div>
                </div>
              ))}
            </div>
          )
        })()}
      </Modal>

      <Modal title="Fechar mês" open={!!modalFechar} onClose={() => setModalFechar(null)}
        footer={<>
          <button onClick={() => setModalFechar(null)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => modalFechar && fecharMes(modalFechar)} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Confirmar fechamento</button>
        </>}
      >
        <p style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>
          Deseja fechar o mês de <strong>{modalFechar ? MESES[modalFechar] : ''}</strong>?
        </p>
        <p style={{ fontSize: 13, color: '#6b7280' }}>O mês será marcado como fechado no histórico.</p>
      </Modal>
    </div>
  )
}
