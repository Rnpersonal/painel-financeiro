import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://maecnubrlproioklanau.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZWNudWJybHByb2lva2xhbmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMjMyMjksImV4cCI6MjA5NTY5OTIyOX0._DXyjPpYIemGp4AoFcYFS9-ICyhbPKivwnMUJFX-3PU'

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
