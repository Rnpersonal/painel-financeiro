import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Lancamento = {
  id: string
  tipo: 'entrada' | 'saida'
  descricao: string
  categoria: string
  data: string
  mes: string
  valor: number
  pendente?: boolean
  created_at?: string
}

export type Categoria = {
  id: string
  nome: string
  tipo: 'entrada' | 'saida'
  cor: string
  created_at?: string
}

export type Fechamento = {
  id: string
  mes: string
  status: 'aberto' | 'fechado'
  observacoes?: string
  created_at?: string
}
