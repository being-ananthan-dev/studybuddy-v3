import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserStats } from '../services/user.service'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function formatMinutes(mins) {
  if (!mins || mins < 60) return `${mins || 0}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function Profile() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (user?.uid) {
      getUserStats(user.uid).then(setStats).catch(() => {})
    }
  }, [user?.uid])

  const s = stats || {}
  const displayName = user?.displayName || 'Student'
  const email = user?.email || 'student@studybuddy.app'
  const photoURL = user?.photoURL
  const initial = displayName.charAt(0).toUpperCase()

  const statCards = [
    { icon: '🔥', value: s.streak || 0,                 label: 'Day Streak', bg: 'bg-orange-500/10 text-orange-500' },
    { icon: '⏱️', value: formatMinutes(s.totalMinutes), label: 'Study Time', bg: 'bg-primary/10 text-primary' },
    { icon: '📝', value: s.notesCount || 0,             label: 'Notes',      bg: 'bg-emerald-500/10 text-emerald-500' },
    { icon: '🏆', value: s.badgesCount || 0,            label: 'Badges',     bg: 'bg-pink-500/10 text-pink-500' },
  ]

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">Profile</h1>
        <p className="text-muted-foreground text-sm">Your account and study statistics</p>
      </div>

      {/* Profile Card */}
      <Card className="p-8 sm:p-10 mb-6 border-border/50 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 gradient-primary" />

        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            className="w-20 h-20 rounded-full mx-auto mb-4 shadow-lg border-4 border-background ring-4 ring-primary/10 object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 shadow-lg flex items-center justify-center text-white text-3xl font-extrabold border-4 border-background ring-4 ring-primary/10">
            {initial}
          </div>
        )}

        <h2 className="text-xl font-black tracking-tight mb-0.5 text-foreground">{displayName}</h2>
        <p className="text-sm text-muted-foreground">{email}</p>
        <Badge variant="secondary" className="mt-3 text-xs font-semibold">Free Plan</Badge>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((st, i) => (
          <Card key={i} className="p-4 flex flex-col items-center text-center hover:-translate-y-0.5 transition-all duration-200 shadow-sm border-border/50 group">
            <div className={`text-xl w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${st.bg} group-hover:scale-110 transition-transform duration-300`}>
              {st.icon}
            </div>
            <div className="text-xl font-black leading-none mb-0.5">{st.value}</div>
            <div className="text-[0.65rem] uppercase tracking-wider font-semibold text-muted-foreground">{st.label}</div>
          </Card>
        ))}
      </div>

      {/* Account Info */}
      <Card className="p-5 sm:p-6 border-border/50 shadow-sm">
        <h3 className="text-base font-bold mb-4 pb-3 border-b border-border/40 flex items-center gap-2">
          <span>🛡️</span> Account Details
        </h3>
        <div className="flex flex-col divide-y divide-border/40">
          {[
            ['Status', <Badge key="s" variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 font-semibold shadow-none">Active</Badge>],
            ['Sign-in Method', <span key="m" className="font-medium text-foreground text-sm">{user?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email & Password'}</span>],
            ['Storage', <span key="st" className="font-medium text-foreground text-sm">Local (IndexedDB) + Cloud (Firebase)</span>],
            ['App Version', <span key="v" className="font-medium text-foreground text-sm">StudyBuddy v3 • React 19</span>],
          ].map(([label, value], i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground font-medium">{label}</span>
              <div className="text-right">{value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
