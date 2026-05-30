'use client'
import { useEffect, useState } from 'react'
import { supabase, type Lancamento, type Categoria } from '@/lib/supabase'
import { fmt, MESES_OPTIONS } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'

const inputStyle = { border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: '#fff', width: '100%', fontFamily: 'inherit' }
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 } as const

export function Lancamentos() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroCat, setFiltroCat] = useState('')
  const [filtroMes, setFiltroMes] = useState('')
  const [modal, setModal] = useState<'novo' | 'editar' | 'excluir' | null>(null)
  const [editing, setEditing] = useState<Lancamento | null>(null)
  const [form, setForm] = useState({ tipo: 'entrada', descricao: '', data: new Date().toISOString().slice(0, 10), valor: '', categoria: '', mes: '2026-04' })

  async function load() {
    setLoading(true)
    const [{ data: l }, { data: c }] = await Promise.all([
      supabase.from('lancamentos').select('*').order('data', { ascending: false }),
      supabase.from('categorias').select('*').order('nome'),
    ])
    setLancamentos(l || [])
    setCategorias(c || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = lancamentos.filter(l =>
    (!busca || l.descricao.toLowerCase().includes(busca.toLowerCase())) &&
    (!filtroTipo || l.tipo === filtroTipo) &&
    (!filtroCat || l.categoria === filtroCat) &&
    (!filtroMes || l.mes === filtroMes)
  )

  function abrirNovo() {
    setForm({ tipo: 'entrada', descricao: '', data: new Date().toISOString().slice(0, 10), valor: '', categoria: categorias[0]?.nome || '', mes: '2026-04' })
    setEditing(null)
    setModal('novo')
  }

  function abrirEditar(l: Lancamento) {
    setForm({ tipo: l.tipo, descricao: l.descricao, data: l.data, valor: String(l.valor), categoria: l.categoria, mes: l.mes })
    setEditing(l)
    setModal('editar')
  }

  async function salvar() {
    if (!form.descricao.trim()) { toast('Informe a descrição', 'erro'); return }
    const valor = parseFloat(form.valor)
    if (!valor || valor <= 0) { toast('Informe um valor válido', 'erro'); return }
    const payload = { tipo: form.tipo as 'entrada' | 'saida', descricao: form.descricao, data: form.data, valor, categoria: form.categoria, mes: form.mes }
    if (editing) {
      const { error } = await supabase.from('lancamentos').update(payload).eq('id', editing.id)
      if (error) { toast('Erro ao atualizar', 'erro'); return }
      toast('Lançamento atualizado!', 'sucesso')
    } else {
      const { error } = await supabase.from('lancamentos').insert(payload)
      if (error) { toast('Erro ao salvar', 'erro'); return }
      toast('Lançamento adicionado!', 'sucesso')
    }
    setModal(null)
    load()
  }

  async function excluir() {
    if (!editing) return
    const { error } = await supabase.from('lancamentos').delete().eq('id', editing.id)
    if (error) { toast('Erro ao excluir', 'erro'); return }
    toast('Lançamento excluído')
    setModal(null)
    load()
  }

  const catsFiltradas = categorias.filter(c => !form.tipo || c.tipo === form.tipo)

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Lançamentos</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Todos os registros financeiros</p>
        </div>
        <button onClick={abrirNovo} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          + Novo Lançamento
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Buscar descrição..." style={{ ...inputStyle, minWidth: 200, width: 'auto' }} />
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">Todos os tipos</option>
          <option value="entrada">Entradas</option>
          <option value="saida">Saídas</option>
        </select>
        <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c.id}>{c.nome}</option>)}
        </select>
        <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">Todos os meses</option>
          {MESES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Ações'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Nenhum lançamento encontrado</td></tr>
            ) : filtered.map(l => (
              <tr key={l.id}>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: '#374151' }}>{l.data}</td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: '#374151' }}>{l.descricao}</td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>{l.categoria}</span>
                </td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ background: l.tipo === 'entrada' ? '#d1fae5' : '#fee2e2', color: l.tipo === 'entrada' ? '#065f46' : '#991b1b', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>
                    {l.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: l.tipo === 'entrada' ? '#059669' : '#dc2626', fontWeight: 700 }}>
                  {l.tipo === 'saida' ? '- ' : '+ '}{fmt(l.valor)}
                </td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', display: 'flex', gap: 6 }}>
                  <button onClick={() => abrirEditar(l)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => { setEditing(l); setModal('excluir') }} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Novo/Editar */}
      <Modal title={editing ? 'Editar Lançamento' : 'Novo Lançamento'} open={modal === 'novo' || modal === 'editar'} onClose={() => setModal(null)}
        footer={<>
          <button onClick={() => setModal(null)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={salvar} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Salvar</button>
        </>}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Tipo</label>
          <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value, categoria: '' }))} style={inputStyle}>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Descrição</label>
          <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} style={inputStyle} placeholder="Ex: Mensalidade turma A" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Data</label>
            <input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Valor (R$)</label>
            <input type="number" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} style={inputStyle} placeholder="0,00" min="0" step="0.01" />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Categoria</label>
          <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} style={inputStyle}>
            {catsFiltradas.map(c => <option key={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Mês de referência</label>
          <select value={form.mes} onChange={e => setForm(f => ({ ...f, mes: e.target.value }))} style={inputStyle}>
            {MESES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </Modal>

      {/* Modal Excluir */}
      <Modal title="Confirmar exclusão" open={modal === 'excluir'} onClose={() => setModal(null)}
        footer={<>
          <button onClick={() => setModal(null)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={excluir} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Excluir</button>
        </>}
      >
        <p style={{ fontSize: 14, color: '#374151' }}>Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  )
}
