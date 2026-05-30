export const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export const MESES: Record<string, string> = {
  '2026-12': 'Dezembro 2026', '2026-11': 'Novembro 2026', '2026-10': 'Outubro 2026',
  '2026-09': 'Setembro 2026', '2026-08': 'Agosto 2026', '2026-07': 'Julho 2026',
  '2026-06': 'Junho 2026', '2026-05': 'Maio 2026', '2026-04': 'Abril 2026',
  '2026-03': 'Março 2026', '2026-02': 'Fevereiro 2026', '2026-01': 'Janeiro 2026',
  '2025-12': 'Dezembro 2025', '2025-11': 'Novembro 2025',
}

export const MESES_OPTIONS = Object.entries(MESES).map(([value, label]) => ({ value, label }))

export function getMesAtual(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function toIsoDate(br: string): string {
  const [d, m, y] = br.split('/')
  return `${y}-${m}-${d}`
}
