'use client'
import { useEffect, useState } from 'react'

type ToastType = 'sucesso' | 'erro' | ''

let showToastFn: ((msg: string, tipo?: ToastType) => void) | null = null

export function toast(msg: string, tipo: ToastType = '') {
  showToastFn?.(msg, tipo)
}

export function ToastProvider() {
  const [state, setState] = useState({ msg: '', tipo: '' as ToastType, visible: false })

  useEffect(() => {
    showToastFn = (msg, tipo = '') => {
      setState({ msg, tipo, visible: true })
      setTimeout(() => setState(s => ({ ...s, visible: false })), 2800)
    }
    return () => { showToastFn = null }
  }, [])

  const bg = state.tipo === 'sucesso' ? '#065f46' : state.tipo === 'erro' ? '#991b1b' : '#111827'

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, background: bg, color: '#fff',
      padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
      zIndex: 200, maxWidth: 300,
      opacity: state.visible ? 1 : 0,
      transform: state.visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity .25s, transform .25s',
      pointerEvents: 'none',
    }}>
      {state.msg}
    </div>
  )
}
