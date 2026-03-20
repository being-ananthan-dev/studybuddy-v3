import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Sidebar from './components/Sidebar'
import ErrorBoundary from './components/ErrorBoundary'

const Home       = lazy(() => import('./pages/Home'))
const AI         = lazy(() => import('./pages/AI'))
const Planner    = lazy(() => import('./pages/Planner'))
const Pomodoro   = lazy(() => import('./pages/Pomodoro'))
const FocusRoom  = lazy(() => import('./pages/FocusRoom'))
const Notes      = lazy(() => import('./pages/Notes'))
const Reminders  = lazy(() => import('./pages/Reminders'))
const Groups     = lazy(() => import('./pages/Groups'))
const OralTest   = lazy(() => import('./pages/OralTest'))
const Challenges = lazy(() => import('./pages/Challenges'))
const Profile    = lazy(() => import('./pages/Profile'))
const Settings   = lazy(() => import('./pages/Settings'))
const NotFound   = lazy(() => import('./pages/NotFound'))

function Loader() {
  return (
    <div className="loader">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  )
}

function DashboardLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="content-area">
        <ErrorBoundary>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/"           element={<Home />} />
              <Route path="/ai"         element={<AI />} />
              <Route path="/planner"    element={<Planner />} />
              <Route path="/pomodoro"   element={<Pomodoro />} />
              <Route path="/focusroom"  element={<FocusRoom />} />
              <Route path="/notes"      element={<Notes />} />
              <Route path="/reminders"  element={<Reminders />} />
              <Route path="/groups"     element={<Groups />} />
              <Route path="/oraltest"   element={<OralTest />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/profile"    element={<Profile />} />
              <Route path="/settings"   element={<Settings />} />
              <Route path="*"           element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <DashboardLayout />
    </Suspense>
  )
}
