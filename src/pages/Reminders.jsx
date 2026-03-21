import { useState, useEffect, useRef } from 'react'
import { idbSave, idbGetAll, idbDelete } from '../services/indexeddb.service'
import { useToast } from '../context/ToastContext'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const alarmSoundUri = 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/'

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [input, setInput] = useState('')
  const [targetTime, setTargetTime] = useState('')
  const [priority, setPriority] = useState('Medium')
  
  const { addToast } = useToast()
  const audioRef = useRef(null)

  useEffect(() => { idbGetAll('reminders').then(setReminders).catch(() => {}) }, [])

  useEffect(() => {
    if (reminders.length === 0) return
    const interval = setInterval(() => {
      const now = new Date()
      reminders.forEach(async r => {
        if (!r.completed && r.targetTime) {
          const target = new Date(r.targetTime)
          if (now.getHours() === target.getHours() && now.getMinutes() === target.getMinutes() && !r.fired) {
            triggerAlarm(r)
          }
        }
      })
    }, 10000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders])

  const triggerAlarm = async (reminder) => {
    if (audioRef.current) audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e))
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🚨 ${reminder.priority} Priority Alarm`, { body: reminder.text })
    }
    addToast(`ALARM: ${reminder.text}`, reminder.priority === 'High' ? 'error' : 'info')
    const updated = { ...reminder, fired: true }
    setReminders(rs => rs.map(x => x.id === reminder.id ? updated : x))
    try { await idbSave('reminders', updated) } catch { /* ignore */ }
  }

  const add = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    const r = { 
      id: Date.now(), text: input, targetTime: targetTime || null, priority, completed: false, fired: false
    }
    
    const updated = [...reminders, r].sort((a,b) => {
      const weight = { 'High': 3, 'Medium': 2, 'Low': 1 }
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return weight[b.priority] - weight[a.priority]
    })
    
    setReminders(updated)
    setInput('')
    setTargetTime('')
    setPriority('Medium')
    try { await idbSave('reminders', r) } catch { /* ignore error */ }
    
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
    addToast('Alarm Set!', 'success')
  }

  const toggle = async (id) => {
    setReminders(rs => rs.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
    const r = reminders.find(x => x.id === id)
    if (r) { try { await idbSave('reminders', { ...r, completed: !r.completed }) } catch { /* ignore error */ } }
  }

  const del = async (id) => {
    setReminders(rs => rs.filter(r => r.id !== id))
    try { await idbDelete('reminders', id) } catch { /* ignore error */ }
    addToast('Alarm Deleted', 'info')
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <audio ref={audioRef} src={alarmSoundUri} />
      
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">Priority Alarms</h1>
        <p className="text-muted-foreground text-sm">Deploy high-frequency audible relays and browser push notifications</p>
      </div>
      
      <Card className="p-8 mb-8 border-border/50 shadow-sm bg-gradient-to-br from-card to-secondary/5">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><span>🚨</span> Hardware Alarm Deployment</h3>
        <form className="flex flex-col gap-5" onSubmit={add}>
          <div>
             <label className="font-semibold text-sm mb-2 block">Task Title</label>
             <Input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. History Exam Study Session" required className="bg-background"/>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="font-semibold text-sm mb-2 block">Target Triggertime <span className="text-muted-foreground font-normal">(Optional)</span></label>
              <Input type="datetime-local" value={targetTime} onChange={e => setTargetTime(e.target.value)} className="bg-background"/>
            </div>
            <div>
              <label className="font-semibold text-sm mb-2 block">System Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select Threat Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High" className="text-destructive font-bold">🔴 High (Immediate Action)</SelectItem>
                  <SelectItem value="Medium" className="text-primary font-bold">🟠 Medium (Scheduled)</SelectItem>
                  <SelectItem value="Low" className="text-muted-foreground font-bold">🟢 Low (Casual Reminder)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="submit" size="lg" className="mt-2 w-full md:w-auto self-end font-bold tracking-wide shadow-md">
            Arm Relay
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {reminders.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground border-dashed border-2 bg-secondary/5">
            <p className="text-5xl mb-4 opacity-50">🕒</p>
            <p className="font-semibold">All relay servers silent. No active constraints.</p>
          </Card>
        )}
        
        {reminders.map(r => (
          <Card key={r.id} className={`p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-all hover:shadow-md ${r.completed ? 'opacity-50 grayscale bg-secondary/20' : r.priority === 'High' ? 'border-l-4 border-l-destructive shadow-sm' : r.priority === 'Medium' ? 'border-l-4 border-l-primary shadow-sm' : 'border-l-4 border-l-border'}`}>
            <div className="flex items-start gap-4">
              <Checkbox 
                checked={r.completed} 
                onCheckedChange={() => toggle(r.id)} 
                className="mt-1 w-5 h-5 rounded-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
              />
              <div>
                <span className={`text-[0.95rem] font-bold block mb-1 ${r.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {r.text}
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={r.priority === 'High' ? 'destructive' : r.priority === 'Medium' ? 'default' : 'secondary'} className="text-[0.65rem] px-2 py-0 uppercase tracking-widest shadow-none">
                    {r.priority}
                  </Badge>
                  {r.targetTime && (
                    <Badge variant="outline" className={`text-[0.65rem] px-2 py-0 border-border/50 font-semibold uppercase tracking-wider ${r.fired ? 'bg-destructive/10 text-destructive border-transparent' : 'bg-primary/5 text-primary border-primary/20'}`}>
                      ⏱️ {new Date(r.targetTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => del(r.id)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 h-8 w-8 self-end sm:self-center">
              ✕
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
