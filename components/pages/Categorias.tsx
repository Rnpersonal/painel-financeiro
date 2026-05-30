'use client'
import { useEffect, useState } from 'react'
import { supabase, type Categoria } from '@/lib/supabase'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'

const inputStyle = { border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: '#fff', width: '100%', fontFamily: 'inherit' }
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 } as const

export function Categorias() {
  const [cats, setCats] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'novo' | 'editar' | null>(null)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [form, setForm] = useState({ nome: '', tipo: 'entrada', cor: '#6366f1' })

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('categorias').select('*').order('tipo').order('nome')
    setCats(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function abrirNovo() {
    setForm({ nome: '', tipo: 'entrada', cor: '#6366f1' })
    setEditing(null)
    setModal('novo')
  }

  function abrirEditar(c: Categoria) {
    setForm({ nome: c.nome, tipo: c.tipo, cor: c.cor })
    setEditing(c)
    setModal('editar')
  }

  async function salvar() {
    if (!form.nome.trim()) { toast('Informe o nome', 'erro'); return }
    if (editing) {
      const { error } = await supabase.from('categorias').update(form).eq('id', editing.id)
      if (error) { toast('Erro ao atualizar', 'erro'); return }
      toast('Categoria atualizada!', 'sucesso')
    } else {
      const { error } = await supabase.from('categorias').insert(form)
      if (error) { toast('Erro ao salvar', 'erro'); return }
      toast(`Categoria "${form.nome}" criada!`, 'sucesso')
    }
    setModal(null)
    load()
  }

  const entradas = cats.filter(c => c.tipo === 'entrada')
  const saidas = cats.filter(c => c.tipo === 'saida')

  const Table = ({ items, label }: { items: Categoria[]; label: string }) => (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>{label}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Cor', 'Nome', ''].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(c => (
            <tr key={c.id}>
              <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.cor, display: 'inline-block' }} />
              </td>
              <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', color: '#374151' }}>{c.nome}</td>
              <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                <button onClick={() => abrirEditar(c)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>Editar</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24, color: '#9ca3af', fontSize: 13 }}>Nenhuma categoria</td></tr>}
        </tbody>
      </table>
    </div>
  )

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Categorias</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Gerencie as categorias de lançamentos</p>
        </div>
        <button onClick={abrirNovo} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          + Nova Categoria
        </button>
      </div>

      {loading ? <p style={{ color: '#9ca3af', fontSize: 13 }}>Carregando...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Table items={entradas} label="Categorias de Entrada" />
          <Table items={saidas} label="Categorias de Saída" />
        </div>
      )}

      <Modal title={editing ? 'Editar Categoria' : 'Nova Categoria'} open={!!modal} onClose={() => setModal(null)}
        footer={<>
          <button onClick={() => setModal(null)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={salvar} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Salvar</button>
        </>}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nome</label>
          <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} placeholder="Nome da categoria" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Tipo</label>
            <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} style={inputStyle}>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Cor</label>
            <input type="color" value={form.cor} onChange={e => setForm(f => ({ ...f, cor: e.target.value }))} style={{ ...inputStyle, height: 38, padding: 4, cursor: 'pointer' }} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
