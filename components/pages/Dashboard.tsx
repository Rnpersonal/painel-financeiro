'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase, type Lancamento } from '@/lib/supabase'
import { fmt, MESES, MESES_OPTIONS } from '@/lib/utils'

type CatVal = { nome: string; valor: number; cor: string }

function KPICard({ label, value, variant, sub }: { label: string; value: string; variant: 'verde' | 'vermelho' | 'azul' | 'amarelo'; sub?: string }) {
  const colors = {
    verde: { border: '#10b981', bg: '#f0fdf4', val: '#065f46' },
    vermelho: { border: '#ef4444', bg: '#fef2f2', val: '#991b1b' },
    azul: { border: '#3b82f6', bg: '#eff6ff', val: '#1e40af' },
    amarelo: { border: '#f59e0b', bg: '#fffbeb', val: '#92400e' },
  }[variant]
  return (
    <div style={{ background: colors.bg, borderRadius: 12, padding: 20, borderLeft: `4px solid ${colors.border}`, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: colors.val }}>{value}</div>
      {sub && <div style={{ fontSize: 11, marginTop: 6, color: '#6b7280' }}>{sub}</div>}
    </div>
  )
}

export function Dashboard() {
  const [mes, setMes] = useState('2026-04')
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartPSRef = useRef<HTMLCanvasElement>(null)
  const chartPERef = useRef<HTMLCanvasElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charts = useRef<any>({})

  async function load(m: string) {
    setLoading(true)
    const { data } = await supabase.from('lancamentos').select('*').eq('mes', m).order('data', { ascending: false })
    setLancamentos(data || [])
    setLoading(false)
  }

  useEffect(() => { load(mes) }, [mes])

  useEffect(() => {
    let destroyed = false
    async function initCharts() {
      if (!chartRef.current || !chartPSRef.current || !chartPERef.current) return
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)
      if (destroyed) return

      // destroy previous
      Object.values(charts.current).forEach((c: any) => c.destroy())
      charts.current = {}

      const entradas = lancamentos.filter(l => l.tipo === 'entrada')
      const saidas = lancamentos.filter(l => l.tipo === 'saida')
      const totalE = entradas.reduce((s, l) => s + l.valor, 0)
      const totalS = saidas.reduce((s, l) => s + l.valor, 0)

      // group by category for saida
      const catS: Record<string, CatVal> = {}
      saidas.forEach(l => {
        catS[l.categoria] = catS[l.categoria] || { nome: l.categoria, valor: 0, cor: '#6366f1' }
        catS[l.categoria].valor += l.valor
      })
      const catE: Record<string, CatVal> = {}
      entradas.forEach(l => {
        catE[l.categoria] = catE[l.categoria] || { nome: l.categoria, valor: 0, cor: '#10b981' }
        catE[l.categoria].valor += l.valor
      })

      const catSArr = Object.values(catS)
      const catEArr = Object.values(catE)

      if (chartRef.current) {
        charts.current.bar = new Chart(chartRef.current.getContext('2d')!, {
          type: 'bar',
          data: {
            labels: ['Entradas', 'Saídas'],
            datasets: [
              { label: 'Valor', data: [totalE, totalS], backgroundColor: ['#10b981', '#ef4444'], borderRadius: 4 }
            ]
          },
          options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v: any) => `R$${(v / 1000).toFixed(0)}k` } } } }
        })
      }

      if (chartPSRef.current && catSArr.length > 0) {
        charts.current.ps = new Chart(chartPSRef.current.getContext('2d')!, {
          type: 'doughnut',
          data: { labels: catSArr.map(c => c.nome), datasets: [{ data: catSArr.map(c => c.valor), backgroundColor: ['#6366f1','#ef4444','#f59e0b','#8b5cf6','#3b82f6','#10b981'], borderWidth: 2, borderColor: '#fff' }] },
          options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }
        })
      }

      if (chartPERef.current && catEArr.length > 0) {
        charts.current.pe = new Chart(chartPERef.current.getContext('2d')!, {
          type: 'doughnut',
          data: { labels: catEArr.map(c => c.nome), datasets: [{ data: catEArr.map(c => c.valor), backgroundColor: ['#10b981','#6366f1','#94a3b8'], borderWidth: 2, borderColor: '#fff' }] },
          options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }
        })
      }
    }
    initCharts()
    return () => { destroyed = true }
  }, [lancamentos])

  const totalE = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
  const totalS = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
  const resultado = totalE - totalS
  const margem = totalE > 0 ? ((resultado / totalE) * 100).toFixed(1) : '0.0'
  const pct = totalE > 0 ? Math.min((totalS / totalE) * 100, 100) : 0
  const barColor = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981'

  const catS: Record<string, CatVal> = {}
  lancamentos.filter(l => l.tipo === 'saida').forEach(l => {
    catS[l.categoria] = catS[l.categoria] || { nome: l.categoria, valor: 0, cor: '#6366f1' }
    catS[l.categoria].valor += l.valor
  })
  const catE: Record<string, CatVal> = {}
  lancamentos.filter(l => l.tipo === 'entrada').forEach(l => {
    catE[l.categoria] = catE[l.categoria] || { nome: l.categoria, valor: 0, cor: '#10b981' }
    catE[l.categoria].valor += l.valor
  })

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Dashboard</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{MESES[mes]}</p>
        </div>
        <select value={mes} onChange={e => setMes(e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: '#fff' }}>
          {MESES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', fontSize: 13 }}>Carregando...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            <KPICard label="Total de Entradas" value={fmt(totalE)} variant="verde" />
            <KPICard label="Total de Saídas" value={fmt(totalS)} variant="vermelho" />
            <KPICard label="Resultado Líquido" value={fmt(resultado)} variant={resultado >= 0 ? 'azul' : 'vermelho'} />
            <KPICard label="Margem de Resultado" value={`${margem}%`} variant={parseFloat(margem) >= 20 ? 'verde' : parseFloat(margem) >= 0 ? 'amarelo' : 'vermelho'} />
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
              <span>Saídas vs Entradas</span>
              <span>{pct.toFixed(1)}% das entradas comprometidas</span>
            </div>
            <div style={{ background: '#f3f4f6', borderRadius: 999, height: 12, overflow: 'hidden' }}>
              <div style={{ height: 12, borderRadius: 999, background: barColor, width: `${pct}%`, transition: 'width .5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              <span>R$ 0,00</span><span>{fmt(totalE)}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Entradas vs Saídas</h3>
              <canvas ref={chartRef} height={120} />
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Saídas por Categoria</h3>
              <div style={{ position: 'relative', height: 160 }}><canvas ref={chartPSRef} /></div>
              <div style={{ marginTop: 12 }}>
                {Object.values(catS).sort((a, b) => b.valor - a.valor).slice(0, 4).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: ['#6366f1','#ef4444','#f59e0b','#8b5cf6'][i] || '#ccc', flexShrink: 0 }} />
                    <span style={{ flex: 1, color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</span>
                    <span style={{ color: '#374151', fontWeight: 600 }}>{fmt(c.valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Entradas por Categoria</h3>
              <div style={{ position: 'relative', height: 160 }}><canvas ref={chartPERef} /></div>
              <div style={{ marginTop: 12 }}>
                {Object.values(catE).sort((a, b) => b.valor - a.valor).slice(0, 3).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: ['#10b981','#6366f1','#94a3b8'][i] || '#ccc', flexShrink: 0 }} />
                    <span style={{ flex: 1, color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</span>
                    <span style={{ color: '#374151', fontWeight: 600 }}>{fmt(c.valor)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Últimos Lançamentos</h3>
              {lancamentos.length === 0 ? (
                <p style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>Sem lançamentos neste mês</p>
              ) : lancamentos.slice(0, 8).map(l => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 15 }}>{l.tipo === 'entrada' ? '⬆' : '⬇'}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{l.descricao}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{l.data} <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '1px 6px', borderRadius: 4 }}>{l.categoria}</span></div>
                    </div>
                  </div>
                  <span style={{ color: l.tipo === 'entrada' ? '#059669' : '#dc2626', fontWeight: 700 }}>
                    {l.tipo === 'saida' ? '- ' : '+ '}{fmt(l.valor)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#d1d5db', paddingBottom: 4 }}>
            Dados em tempo real via Supabase
          </p>
        </>
      )}
    </div>
  )
}
