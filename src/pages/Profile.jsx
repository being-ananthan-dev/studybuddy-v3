export default function Profile() {
  const stats = [
    { icon: '🔥', value: '4', label: 'Day Streak', bg: 'hsla(32,95%,52%,0.12)' },
    { icon: '⏱️', value: '12h', label: 'Total Focus', bg: 'hsla(250,85%,60%,0.1)' },
    { icon: '📝', value: '28', label: 'Notes', bg: 'hsla(152,68%,42%,0.1)' },
    { icon: '🏆', value: '2', label: 'Badges', bg: 'hsla(320,80%,58%,0.1)' },
  ]

  return (
    <div className="slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="section-header mb-6"><h1>Your Profile</h1><p>Stats and account details</p></div>
      <div className="card mb-6" style={{ padding: 'var(--s8)', textAlign: 'center' }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--s4)', color: '#fff', fontSize: '2.2rem', fontWeight: 700 }}>S</div>
        <h2 className="mb-2">Student</h2>
        <p className="text-sm text-muted">student@studybuddy.app</p>
      </div>
      <div className="grid grid-2 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 'var(--s5)' }}>
        <h3 className="mb-3">Account Details</h3>
        {[
          ['Sync Status', <span style={{ color: 'var(--success)' }}>Cloud Active</span>],
          ['Member Since', 'March 2026'],
          ['App Version', 'V3 React'],
        ].map(([label, value], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--s2) 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', fontSize: '0.9rem' }}>
            <span className="text-muted">{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
