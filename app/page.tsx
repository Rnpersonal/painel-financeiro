'use client'
import { useState } from 'react'
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
  const [page, setPage] = useState<Page>('dashboard')

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
