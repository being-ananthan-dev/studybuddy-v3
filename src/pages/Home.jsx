import { Link } from 'react-router-dom'

const features = [
  { to: '/ai',         icon: '🤖', label: 'AI Tutor' },
  { to: '/planner',    icon: '📅', label: 'Planner' },
  { to: '/pomodoro',   icon: '⏱️', label: 'Pomodoro' },
  { to: '/focusroom',  icon: '👥', label: 'Focus Room' },
  { to: '/notes',      icon: '📓', label: 'Notes' },
  { to: '/reminders',  icon: '🔔', label: 'Reminders' },
  { to: '/groups',     icon: '💬', label: 'Study Chat' },
  { to: '/oraltest',   icon: '🎤', label: 'Oral Test' },
  { to: '/challenges', icon: '🏆', label: 'Badges' },
  { to: '/profile',    icon: '👤', label: 'Profile' },
  { to: '/settings',   icon: '⚙️', label: 'Settings' },
]

const stats = [
  { icon: '🔥', value: '4', label: 'Day Streak', bg: 'hsla(32,95%,52%,0.12)' },
  { icon: '⏱️', value: '12h', label: 'This Week', bg: 'hsla(250,85%,60%,0.1)' },
  { icon: '📝', value: '28', label: 'Notes Saved', bg: 'hsla(152,68%,42%,0.1)' },
  { icon: '🏆', value: '2', label: 'Badges', bg: 'hsla(320,80%,58%,0.1)' },
]

const quotes = [
  "The way to get started is to quit talking and begin doing. 💪",
  "Success is the sum of small efforts, repeated day in and day out. 🌟",
  "Study hard, stay focused, and great things will happen. 🚀",
  "Your future self will thank you for studying today. 📖",
]

function Heatmap() {
  const cells = Array.from({ length: 30 }, () => Math.floor(Math.random() * 5))
  return (
    <div className="heatmap">
      {cells.map((level, i) => <div key={i} className="heat-cell" data-level={level} />)}
    </div>
  )
}

export default function Home() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)]

  return (
    <div className="slide-up">
      <div className="section-header mb-8">
        <h1><span className="gradient-text">Welcome back, Student</span></h1>
        <p style={{ marginTop: 'var(--s2)' }}>{quote}</p>
      </div>

      <div className="grid grid-2 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-4" style={{ fontSize: '1.1rem' }}>Quick Actions</h2>
      <div className="quick-grid mb-8">
        {features.map(f => (
          <Link key={f.to} to={f.to} className="feature-card">
            <div className="fc-icon">{f.icon}</div>
            <div className="fc-label">{f.label}</div>
          </Link>
        ))}
      </div>

      <div className="card" style={{ padding: 'var(--s6)' }}>
        <h3 className="mb-2">Productivity Heatmap</h3>
        <p className="text-sm text-muted mb-4">Last 30 days</p>
        <Heatmap />
      </div>
    </div>
  )
}
