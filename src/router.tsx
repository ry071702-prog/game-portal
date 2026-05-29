import { createBrowserRouter } from 'react-router-dom'
import PortalPage from './pages/PortalPage'
import GamePage from './pages/GamePage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/', element: <PortalPage /> },
  { path: '/games/:id', element: <GamePage /> },
  { path: '*', element: <NotFoundPage /> },
])
