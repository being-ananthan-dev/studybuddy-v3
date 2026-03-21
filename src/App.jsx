import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Sidebar from './components/Sidebar'
import PrivateRoute from './components/PrivateRoute'
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
const Chanakya   = lazy(() => import('./pages/Chanakya'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const Whiteboard = lazy(() => import('./pages/Whiteboard'))
const Login      = lazy(() => import('./pages/Login'))
const NotFound   = lazy(() => import('./pages/NotFound'))

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4 bg-background text-muted-foreground">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <p className="text-sm font-medium animate-pulse">Loading StudyBuddy...</p>
    </div>
  )
}

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:ml-64 pt-16 lg:pt-0">
        <div className="h-full min-h-screen p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto lg:mx-0 xl:mx-auto">
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
                <Route path="/chanakya"   element={<Chanakya />} />
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/whiteboard" element={<Whiteboard />} />
                <Route path="*"           element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public route — Login page (no sidebar) */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes — wrapped in PrivateRoute + DashboardLayout */}
        <Route path="/*" element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        } />
      </Routes>
    </Suspense>
  )
}
