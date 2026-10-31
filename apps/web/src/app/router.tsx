import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { Home } from '@/pages/Home/Home'

// Vitrine de componentes: só existe em dev e fica fora do bundle de produção.
const DevUi = import.meta.env.DEV
  ? lazy(() => import('@/pages/DevUi/DevUi').then((m) => ({ default: m.DevUi })))
  : null

export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        {DevUi && <Route path="/dev/ui" element={<DevUi />} />}
      </Routes>
    </Suspense>
  )
}
