import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { Home } from '@/pages/Home/Home'
import { SongSetup } from '@/pages/SongSetup/SongSetup'

// Páginas de dev (vitrine e bancada do player): ficam fora do bundle de produção.
const DevUi = import.meta.env.DEV
  ? lazy(() => import('@/pages/DevUi/DevUi').then((m) => ({ default: m.DevUi })))
  : null
const DevPlayer = import.meta.env.DEV
  ? lazy(() => import('@/pages/DevPlayer/DevPlayer').then((m) => ({ default: m.DevPlayer })))
  : null

export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/musica/:videoId" element={<SongSetup />} />
        {DevUi && <Route path="/dev/ui" element={<DevUi />} />}
        {DevPlayer && <Route path="/dev/player/:videoId" element={<DevPlayer />} />}
      </Routes>
    </Suspense>
  )
}
