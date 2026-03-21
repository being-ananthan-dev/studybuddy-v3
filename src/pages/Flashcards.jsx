import { useState, useEffect, useMemo, useCallback } from 'react'
import { idbSave, idbGetAll, idbDelete } from '../services/indexeddb.service'
import { useToast } from '../context/ToastContext'
import { logActivity } from '../services/user.service'
import { useAuth } from '../context/AuthContext'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Spaced Repetition Logic (SM-2 variant)
const calcNextReview = (quality, currentInterval, currentEase) => {
  let interval = currentInterval
  let ease = currentEase
  
  if (quality === 0) { // Hard
    interval = 0
    ease = Math.max(1.3, ease - 0.2)
  } else if (quality === 1) { // Good
    interval = interval === 0 ? 1 : interval * ease
  } else if (quality === 2) { // Easy
    interval = interval === 0 ? 4 : interval * ease * 1.3
    ease += 0.15
  }
  
  // Set time exactly to midnight of the future date to avoid intra-day drifting
  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + Math.round(interval))
  nextDate.setHours(0, 0, 0, 0)
  
  return { interval: Math.round(interval), ease, nextReview: nextDate.getTime() }
}

export default function Flashcards() {
  const [decks, setDecks] = useState([])
  const [cards, setCards] = useState([])
  
  // 'home' | 'deck' | 'study'
  const [view, setView] = useState('home') 
  const [activeDeck, setActiveDeck] = useState(null)
  
  // Forms
  const [newDeckName, setNewDeckName] = useState('')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')

  // Study state
  const [studyQueue, setStudyQueue] = useState([])
  const [currentCardIdx, setCurrentCardIdx] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const { addToast } = useToast()
  const { user } = useAuth()

  // Load data
  useEffect(() => {
    Promise.all([idbGetAll('decks'), idbGetAll('flashcards')]).then(([d, c]) => {
      setDecks(d || [])
      setCards(c || [])
    }).catch(console.error)
  }, [])

  // ------------------------------------------------------------------
  // DECKS
  // ------------------------------------------------------------------
  const createDeck = async () => {
    if (!newDeckName.trim()) return
    const deck = { id: Date.now().toString(), name: newDeckName.trim(), createdAt: Date.now() }
    setDecks([...decks, deck])
    setNewDeckName('')
    await idbSave('decks', deck)
    addToast('Deck created!', 'success')
  }

  const deleteDeck = async (id) => {
    if (!window.confirm('Delete deck and all its cards?')) return
    setDecks(decks.filter(d => d.id !== id))
    const cardsToDelete = cards.filter(c => c.deckId === id)
    setCards(cards.filter(c => c.deckId !== id))
    
    await idbDelete('decks', id)
    for (const c of cardsToDelete) await idbDelete('flashcards', c.id)
    addToast('Deck deleted', 'info')
  }

  // ------------------------------------------------------------------
  // CARDS 
  // ------------------------------------------------------------------
  const addCard = async () => {
    if (!front.trim() || !back.trim()) return
    const card = {
      id: Date.now().toString(),
      deckId: activeDeck.id,
      front: front.trim(),
      back: back.trim(),
      nextReview: Date.now(), // Due immediately
      interval: 0,
      ease: 2.5
    }
    setCards([...cards, card])
    setFront('')
    setBack('')
    await idbSave('flashcards', card)
    addToast('Card added!', 'success')
  }

  const deleteCard = async (id) => {
    setCards(cards.filter(c => c.id !== id))
    await idbDelete('flashcards', id)
  }

  // ------------------------------------------------------------------
  // STUDY MODE
  // ------------------------------------------------------------------
  const startStudy = (deck) => {
    const now = Date.now()
    // Find due cards: nextReview is in the past or today
    const due = cards.filter(c => c.deckId === deck.id && c.nextReview <= now)
    
    if (due.length === 0) {
      addToast('No cards due for this deck right now! Great job!', 'success')
      return
    }
    
    // Shuffle queue
    setStudyQueue(due.sort(() => Math.random() - 0.5))
    setCurrentCardIdx(0)
    setIsFlipped(false)
    setActiveDeck(deck)
    setView('study')
  }

  const handleAnswer = async (quality) => {
    const card = studyQueue[currentCardIdx]
    const { interval, ease, nextReview } = calcNextReview(quality, card.interval || 0, card.ease || 2.5)
    
    const updatedCard = { ...card, interval, ease, nextReview }
    
    // Update local state and DB
    setCards(prev => prev.map(c => c.id === card.id ? updatedCard : c))
    await idbSave('flashcards', updatedCard)
    
    setIsFlipped(false)
    
    // Crucial SRS fix: If they hit 'Hard', they must see it again this session.
    let nextQueue = [...studyQueue]
    if (quality === 0) {
      nextQueue.push(updatedCard)
      setStudyQueue(nextQueue)
      addToast('Card marked Hard. You will see it again soon.', 'info')
    }
    
    if (currentCardIdx + 1 < nextQueue.length) {
      setCurrentCardIdx(currentCardIdx + 1)
    } else {
      setView('home')
      setActiveDeck(null)
      addToast('Study session complete! 🎉', 'success')
      if (user?.uid) logActivity(user.uid, 'flashcards').catch(() => {})
    }
  }

  // ------------------------------------------------------------------
  // RENDERERS
  // ------------------------------------------------------------------
  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-primary">Flashcards Studio</h1>
          <p className="text-muted-foreground text-sm font-medium">Spaced repetition for long-term memory</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            placeholder="New deck name..." 
            value={newDeckName} 
            onChange={e => setNewDeckName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createDeck()}
            className="flex-1 bg-background"
          />
          <Button onClick={createDeck} disabled={!newDeckName.trim()}>Create</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {decks.map(deck => {
          const deckCards = cards.filter(c => c.deckId === deck.id)
          const dueCount = deckCards.filter(c => c.nextReview <= Date.now()).length
          
          return (
            <Card key={deck.id} className="p-5 flex flex-col gap-4 border-border/50 hover:border-primary/50 transition-colors group cursor-pointer" onClick={() => { setActiveDeck(deck); setView('deck') }}>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{deck.name}</h3>
                <Badge variant={dueCount > 0 ? "default" : "secondary"} className="shrink-0">{dueCount} Due</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-auto">{deckCards.length} total cards</p>
              <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                <Button className="flex-1" size="sm" onClick={() => startStudy(deck)} disabled={dueCount === 0}>Study Now</Button>
                <Button variant="ghost" size="sm" onClick={() => deleteDeck(deck.id)} className="text-destructive hover:bg-destructive/10">✕</Button>
              </div>
            </Card>
          )
        })}
        {decks.length === 0 && (
          <div className="col-span-full py-12 text-center border-dashed border-2 border-border/50 rounded-xl bg-secondary/5">
            <p className="text-4xl mb-3 opacity-80">🗂️</p>
            <p className="font-semibold text-muted-foreground mb-1">No decks yet</p>
            <p className="text-xs text-muted-foreground">Create your first deck to start adding flashcards.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderDeck = () => {
    const deckCards = cards.filter(c => c.deckId === activeDeck.id)
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <Button variant="ghost" className="mb-2 -ml-3 text-muted-foreground" onClick={() => { setView('home'); setActiveDeck(null) }}>
          ← Back to Decks
        </Button>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{activeDeck.name}</h2>
          <Button onClick={() => startStudy(activeDeck)}>Study Deck</Button>
        </div>

        <Card className="p-5 border-primary/20 bg-primary/5">
          <h4 className="font-semibold mb-3 text-sm tracking-wide uppercase text-primary">Add New Card</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <Textarea value={front} onChange={e => setFront(e.target.value)} placeholder="Front (Term/Question)" className="bg-background resize-none h-20" />
            <Textarea value={back} onChange={e => setBack(e.target.value)} placeholder="Back (Definition/Answer)" className="bg-background resize-none h-20" />
          </div>
          <Button onClick={addCard} className="w-full mt-3" disabled={!front.trim() || !back.trim()}>Add Card</Button>
        </Card>

        <h4 className="font-semibold mt-8 mb-3 text-sm tracking-wide uppercase text-muted-foreground">Cards in Deck ({deckCards.length})</h4>
        <div className="flex flex-col gap-3">
          {deckCards.map(c => (
            <div key={c.id} className="flex flex-col sm:flex-row gap-3 p-4 bg-card border border-border/50 rounded-xl justify-between items-start sm:items-center">
              <div className="grid grid-cols-2 gap-4 flex-1 w-full text-sm">
                <div className="font-semibold truncate" title={c.front}>{c.front}</div>
                <div className="text-muted-foreground truncate" title={c.back}>{c.back}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteCard(c.id)} className="text-destructive h-7 px-2 -mr-2 shrink-0">Delete</Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderStudy = () => {
    const card = studyQueue[currentCardIdx]
    if (!card) return null

    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-140px)] animate-in zoom-in-95 duration-500">
        <div className="flex justify-between w-full mb-6 items-center">
          <Button variant="link" className="text-muted-foreground" onClick={() => setView('home')}>End Session</Button>
          <div className="text-sm font-bold bg-secondary/50 px-3 py-1 rounded-full text-foreground/80">
            {currentCardIdx + 1} / {studyQueue.length}
          </div>
        </div>

        {/* 3D Flip Card Container */}
        <div className="w-full aspect-[4/3] sm:aspect-video perspective-1000 mb-8" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front */}
            <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 sm:p-12 text-center border-border shadow-md">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold absolute top-6">Question</p>
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug">{card.front}</h2>
              <p className="text-xs text-primary/70 absolute bottom-6 font-semibold tracking-wide animate-pulse">Click to flip</p>
            </Card>

            {/* Back */}
            <Card className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 sm:p-12 text-center border-primary shadow-lg bg-primary/5">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold absolute top-6">Answer</p>
              <h2 className="text-xl sm:text-2xl font-semibold leading-snug text-foreground whitespace-pre-wrap">{card.back}</h2>
            </Card>
            
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`w-full flex justify-center gap-3 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Button onClick={(e) => { e.stopPropagation(); handleAnswer(0) }} variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white font-bold h-12">
            Hard
          </Button>
          <Button onClick={(e) => { e.stopPropagation(); handleAnswer(1) }} variant="outline" className="flex-1 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold h-12">
            Good
          </Button>
          <Button onClick={(e) => { e.stopPropagation(); handleAnswer(2) }} variant="outline" className="flex-1 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white font-bold h-12">
            Easy
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {view === 'home' && renderHome()}
      {view === 'deck' && renderDeck()}
      {view === 'study' && renderStudy()}
    </div>
  )
}
