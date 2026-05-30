'use client'
import { useState } from 'react'
import { toast } from '@/components/ui/Toast'

export function Importar() {
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState(0)
  const [importing, setImporting] = useState(false)
  const [status, setStatus] = useState('')

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFileName(f.name)
  }

  function simular() {
    if (!fileName) { toast('Selecione um arquivo primeiro', 'erro'); return }
    setImporting(true)
    setProgress(0)
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 18 + 5
      if (p >= 100) {
        p = 100
        clearInterval(iv)
        setStatus('✓ 34 registros importados com sucesso!')
        toast('Extrato importado com sucesso!', 'sucesso')
        setImporting(false)
      } else {
        setStatus(p < 40 ? 'Lendo arquivo...' : p < 70 ? 'Processando transações...' : 'Categorizando lançamentos...')
      }
      setProgress(Math.min(p, 100))
    }, 120)
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Importar</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Importe extratos bancários em CSV ou OFX</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Selecione o arquivo</h3>
          <input type="file" id="file-input" accept=".csv,.ofx,.xlsx" onChange={onFile} style={{ display: 'none' }} />
          <label htmlFor="file-input" style={{
            border: '2px dashed #e5e7eb', borderRadius: 12, padding: 40, textAlign: 'center',
            cursor: 'pointer', display: 'block', transition: 'border-color .2s',
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              {fileName || 'Clique para selecionar ou arraste aqui'}
            </h4>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Formatos aceitos: .csv, .ofx, .xlsx</p>
          </label>

          {importing && (
            <div style={{ marginTop: 12 }}>
              <div style={{ background: '#f3f4f6', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <div style={{ height: 8, borderRadius: 999, background: '#4f46e5', width: `${progress}%`, transition: 'width .4s' }} />
              </div>
              <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 8 }}>{status}</p>
            </div>
          )}
          {!importing && status && (
            <p style={{ fontSize: 12, color: '#059669', textAlign: 'center', marginTop: 12 }}>{status}</p>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <select style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: '#fff' }}>
              <option>Conta Corrente — Nubank</option>
              <option>Conta Corrente — Itaú</option>
              <option>Cartão Amex</option>
            </select>
            <button onClick={simular} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Importar
            </button>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Histórico de importações</h3>
          <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>
            Nenhuma importação realizada ainda.
          </p>
        </div>
      </div>
    </div>
  )
}
