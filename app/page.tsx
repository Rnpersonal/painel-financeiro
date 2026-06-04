'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { Dashboard } from '@/components/pages/Dashboard'
import { Lancamentos } from '@/components/pages/Lancamentos'
import { Importar } from '@/components/pages/Importar'
import { Pendentes } from '@/components/pages/Pendentes'
import { Fechamentos } from '@/components/pages/Fechamentos'
import { Categorias } from '@/components/pages/Categorias'
import { Configuracoes } from '@/components/pages/Configuracoes'
import { ToastProvider } from '@/components/ui/Toast'

type Page = 'dashboard' | 'lancamentos' | 'importar' | 'pendentes' | 'fechamentos' | 'categorias' | 'configuracoes'

export default function Home() {
  const router = useRouter()
  const [page, setPage] = useState<Page>('dashboard')
  const [autenticado, setAutenticado] = useState(false)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login')
      } else {
        setAutenticado(true)
      }
      setVerificando(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login')
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  if (verificando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}>Carregando...</div>
      </div>
    )
  }

  if (!autenticado) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar current={page} onChange={setPage} />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'lancamentos' && <Lancamentos />}
        {page === 'importar' && <Importar />}
        {page === 'pendentes' && <Pendentes />}
        {page === 'fechamentos' && <Fechamentos />}
        {page === 'categorias' && <Categorias />}
        {page === 'configuracoes' && <Configuracoes />}
      </main>
      <ToastProvider />
    </div>
  )
}
