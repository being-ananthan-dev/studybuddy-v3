import { useRef, useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const COLORS = [
  { name: 'Black', hex: '#0f172a' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Highlighter', hex: '#fef08a' }, // New Highlighter Tool
  { name: 'Eraser', hex: '#ffffff' }, 
]

export default function Whiteboard() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(COLORS[0].hex)
  const [lineWidth, setLineWidth] = useState(3)
  
  // Undo / Redo State
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)

  const saveState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    setHistory(prev => {
      // If we are back in time, slice the future history
      const newHist = prev.slice(0, historyStep + 1)
      newHist.push(data)
      // Limit to 25 history steps to prevent excessive RAM usage
      if (newHist.length > 25) newHist.shift()
      return newHist
    })
    setHistoryStep(prev => Math.min(prev + 1, 24))
  }, [historyStep])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // Save initial blank state
    saveState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e) => {
    e.preventDefault() 
    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = color
    
    // Custom logic for eraser and highlighter
    if (color === '#ffffff') {
      ctx.lineWidth = lineWidth * 5
      ctx.globalAlpha = 1.0
    } else if (color === '#fef08a') {
      ctx.lineWidth = lineWidth * 4
      ctx.globalAlpha = 0.4 // Highlighter opacity
    } else {
      ctx.lineWidth = lineWidth
      ctx.globalAlpha = 1.0
    }
  }

  const draw = (e) => {
    e.preventDefault()
    if (!isDrawing) return
    const { x, y } = getCoordinates(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.closePath()
      ctx.globalAlpha = 1.0 // reset immediately
    }
    saveState()
  }

  const undo = useCallback(() => {
    if (historyStep > 0) {
      const step = historyStep - 1
      const ctx = canvasRef.current.getContext('2d')
      ctx.putImageData(history[step], 0, 0)
      setHistoryStep(step)
    }
  }, [history, historyStep])

  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const step = historyStep + 1
      const ctx = canvasRef.current.getContext('2d')
      ctx.putImageData(history[step], 0, 0)
      setHistoryStep(step)
    }
  }, [history, historyStep])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
      } else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const clearCanvas = () => {
    if (!window.confirm('Clear the whole board?')) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveState() // Save clear action to history
  }

  const saveCanvas = () => {
    const canvas = canvasRef.current
    const dataURL = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `StudyBuddy-Board-${new Date().toISOString().split('T')[0]}.png`
    link.href = dataURL
    link.click()
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto h-[calc(100dvh-120px)] flex flex-col pb-6">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">Digital Whiteboard</h1>
        <p className="text-muted-foreground text-sm font-medium">Draw diagrams, solve math, or sketch ideas. (Ctrl+Z to Undo)</p>
      </div>

      <Card className="flex-1 flex flex-col bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden p-3 gap-3">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/20 p-2 sm:p-3 rounded-xl border border-border/50">
          
          <div className="flex flex-wrap items-center gap-2">
            {COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => setColor(c.hex)}
                className={`w-8 h-8 rounded-full border-2 transition-transform shadow-sm flex items-center justify-center
                  ${color === c.hex ? 'scale-110 border-primary ring-2 ring-primary/20' : 'border-border/60 hover:scale-105'}`}
                style={{ backgroundColor: c.name === 'Eraser' ? '#fff' : c.hex }}
                title={c.name}
              >
                {c.name === 'Eraser' && <span className="text-xs">🧽</span>}
                {c.name === 'Highlighter' && <span className="text-[10px] drop-shadow-sm">🖍️</span>}
              </button>
            ))}
            
            <div className="w-px h-6 bg-border/60 mx-2 hidden sm:block" />
            
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mr-4">
              <span className="text-xs">Thin</span>
              <input 
                type="range" 
                min="1" max="15" 
                value={lineWidth} 
                onChange={e => setLineWidth(Number(e.target.value))}
                className="w-20 accent-primary"
              />
              <span className="text-xs">Thick</span>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={undo} disabled={historyStep <= 0} title="Undo (Ctrl+Z)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
              </Button>
              <Button variant="ghost" size="icon" onClick={redo} disabled={historyStep >= history.length - 1} title="Redo (Ctrl+Y)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearCanvas} className="font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive">
              Clear Board
            </Button>
            <Button size="sm" onClick={saveCanvas} className="font-semibold shadow-sm">
              💾 Save PNG
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 rounded-xl overflow-hidden border border-border/60 shadow-inner bg-accent/5 relative touch-none">
          <canvas
            ref={canvasRef}
            width={1600}
            height={900}
            className="absolute top-0 left-0 w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </Card>
    </div>
  )
}
