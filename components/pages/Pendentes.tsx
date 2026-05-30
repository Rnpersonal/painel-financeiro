'use client'
import { useEffect, useState } from 'react'
import { supabase, type Lancamento, type Categoria } from '@/lib/supabase'
import { fmt, MESES_OPTIONS } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'

export function Pendentes() {
  const [pendentes, setPendentes] = useState<Lancamento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Lancamento | null>(null)
  const [catSel, setCatSel] = useState('')
  const [mesSel, setMesSel] = useState('2026-04')

  async function load() {
    setLoading(true)
    const [{ data: l }, { data: c }] = await Promise.all([
      supabase.from('lancamentos').select('*').eq('categoria', 'Sem categoria').order('data', { ascending: false }),
      supabase.from('categorias').select('*').order('nome'),
    ])
    setPendentes(l || [])
    setCategorias(c || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function categorizar() {
    if (!catSel || !modal) { toast('Selecione uma categoria', 'erro'); return }
    const { error } = await supabase.from('lancamentos').update({ categoria: catSel, mes: mesSel }).eq('id', modal.id)
    if (error) { toast('Erro ao categorizar', 'erro'); return }
    toast('Lançamento categorizado!', 'sucesso')
    setModal(null)
    load()
  }

  async function resolverTodos() {
    if (pendentes.length === 0) return
    await supabase.from('lancamentos').delete().in('id', pendentes.map(p => p.id))
    toast('Todos os pendentes resolvidos!', 'sucesso')
    load()
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Pendentes</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Lançamentos aguardando categorização</p>
        </div>
        {pendentes.length > 0 && (
          <button onClick={resolverTodos} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Resolver todos
          </button>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Data', 'Descrição', 'Valor', 'Situação', 'Ações'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Carregando...</td></tr>
            ) : pendentes.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Nenhum lançamento pendente 🎉</td></tr>
            ) : pendentes.map(l => (
              <tr key={l.id}>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: '#374151' }}>{l.data}</td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: '#374151' }}>{l.descricao}</td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: l.tipo === 'entrada' ? '#059669' : '#dc2626', fontWeight: 700 }}>
                  {l.tipo === 'saida' ? '− ' : '+ '}{fmt(l.valor)}
                </td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>Sem categoria</span>
                </td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                  <button onClick={() => { setModal(l); setCatSel(categorias[0]?.nome || '') }} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                    Categorizar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal title="Categorizar Lançamento" open={!!modal} onClose={() => setModal(null)}
        footer={<>
          <button onClick={() => setModal(null)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={categorizar} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Mover para Lançamentos</button>
        </>}
      >
        {modal && (
          <>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}><strong>{modal.descricao}</strong></p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Categoria</label>
              <select value={catSel} onChange={e => setCatSel(e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: '#fff', width: '100%' }}>
                {categorias.map(c => <option key={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Mês de referência</label>
              <select value={mesSel} onChange={e => setMesSel(e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: '#fff', width: '100%' }}>
                {MESES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
