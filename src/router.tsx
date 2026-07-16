import { createBrowserRouter } from 'react-router-dom'
import PortalPage from './pages/PortalPage'
import GamePage from './pages/GamePage'
import LeaderboardPage from './pages/LeaderboardPage'
import DailyPage from './pages/DailyPage'
import PrivacyPage from './pages/PrivacyPage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/', element: <PortalPage /> },
  { path: '/games/:id', element: <GamePage /> },
  { path: '/daily', element: <DailyPage /> },
  { path: '/leaderboard', element: <LeaderboardPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '*', element: <NotFoundPage /> },
])
