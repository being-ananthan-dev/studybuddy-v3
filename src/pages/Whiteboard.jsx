import { useRef, useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const COLORS = [
  { name: 'Black', hex: '#0f172a' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Highlighter', hex: '#fef08a' }, 
  { name: 'Eraser', hex: '#ffffff' }, 
]

const TOOLS = [
  { id: 'pen', icon: '✏️', label: 'Pen' },
  { id: 'line', icon: '➖', label: 'Line' },
  { id: 'rect', icon: '⬜', label: 'Rectangle' },
  { id: 'circle', icon: '⭕', label: 'Circle' }
]

const BACKGROUNDS = [
  { id: 'grid', label: 'Grid Paper' },
  { id: 'ruled', label: 'Ruled Lines' },
  { id: 'blank', label: 'Blank Page' }
]

export default function Whiteboard() {
  const canvasRef = useRef(null)
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(COLORS[0].hex)
  const [lineWidth, setLineWidth] = useState(3)
  const [currentTool, setCurrentTool] = useState('pen')
  const [bgStyle, setBgStyle] = useState('grid')
  
  // State buffers
  const startImageDataRef = useRef(null)
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)

  const saveState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    setHistory(prev => {
      const newHist = prev.slice(0, historyStep + 1)
      newHist.push(data)
      if (newHist.length > 25) newHist.shift()
      return newHist
    })
    setHistoryStep(prev => Math.min(prev + 1, 24))
  }, [historyStep])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    saveState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Snapshot allowing dynamic shape rendering
    startImageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    canvas.dataset.startX = x
    canvas.dataset.startY = y

    ctx.beginPath()
    ctx.moveTo(x, y)
    
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = color
    
    // Handle True Eraser and Highlighter
    if (color === '#ffffff' && currentTool === 'pen') {
      ctx.globalCompositeOperation = 'destination-out' // Truly transparent
      ctx.lineWidth = lineWidth * 5
      ctx.globalAlpha = 1.0
    } else {
      ctx.globalCompositeOperation = 'source-over'
      if (color === '#fef08a') {
        ctx.lineWidth = lineWidth * 4
        ctx.globalAlpha = 0.4
      } else {
        ctx.lineWidth = lineWidth
        ctx.globalAlpha = 1.0
      }
    }
  }

  const draw = (e) => {
    e.preventDefault()
    if (!isDrawing) return
    const { x, y } = getCoordinates(e)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Handle geometric shapes live-preview
    if (currentTool !== 'pen' && color !== '#ffffff') {
      ctx.putImageData(startImageDataRef.current, 0, 0)
      ctx.beginPath()
      const startX = parseFloat(canvas.dataset.startX)
      const startY = parseFloat(canvas.dataset.startY)
      
      if (currentTool === 'line') {
        ctx.moveTo(startX, startY)
        ctx.lineTo(x, y)
      } else if (currentTool === 'rect') {
        ctx.rect(startX, startY, x - startX, y - startY)
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI)
      }
      ctx.stroke()
    } else {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.closePath()
      ctx.globalAlpha = 1.0
      ctx.globalCompositeOperation = 'source-over'
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
      else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const clearCanvas = () => {
    if (!window.confirm('Clear the whole board?')) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    saveState() 
  }

  const saveCanvas = () => {
    const canvas = canvasRef.current
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tCtx = tempCanvas.getContext('2d')
    
    // Ensure the saved PNG has a white background, not transparent black
    tCtx.fillStyle = '#ffffff'
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    tCtx.drawImage(canvas, 0, 0)
    
    const dataURL = tempCanvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `StudyBuddy-Board-${new Date().toISOString().split('T')[0]}.png`
    link.href = dataURL
    link.click()
  }

  const getCanvasStyle = () => {
    if (bgStyle === 'grid') return { backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '30px 30px', backgroundColor: '#ffffff' }
    if (bgStyle === 'ruled') return { backgroundImage: 'linear-gradient(transparent 39px, #60a5fa 40px)', backgroundSize: '100% 40px', backgroundColor: '#ffffff', backgroundPositionY: '8px' }
    return { backgroundColor: '#ffffff' }
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-[1400px] w-full mx-auto h-[calc(100dvh-120px)] flex flex-col pb-6">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">Pro Whiteboard</h1>
        <p className="text-muted-foreground text-sm font-medium">Draw shapes, snap to grids, and save high-res notes. <span className="opacity-60">(Ctrl+Z to Undo)</span></p>
      </div>

      <Card className="flex-1 flex flex-col bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden p-2 gap-2 border-border/60">
        
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/30 p-2 rounded-xl border border-border/40">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Shapes Group */}
            <div className="flex bg-background rounded-lg border border-border/60 shadow-sm p-1 gap-1">
              {TOOLS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setCurrentTool(t.id)}
                  className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-sm transition-all
                    ${currentTool === t.id ? 'bg-primary/20 text-primary scale-105 shadow-sm' : 'hover:bg-accent text-foreground grayscale'}`}
                  title={t.label}
                >
                  {t.icon}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-border/60 mx-1 hidden sm:block" />

            {/* Colors Group */}
            <div className="flex flex-wrap items-center gap-1.5 bg-background p-1.5 rounded-lg border border-border/60 shadow-sm">
              {COLORS.map(c => (
                <button
                  key={c.name}
                  onClick={() => { setColor(c.hex); if (c.name==='Eraser') setCurrentTool('pen') }}
                  className={`w-7 h-7 rounded-md border-2 transition-transform shrink-0 flex items-center justify-center
                    ${color === c.hex ? 'scale-110 border-primary shadow-md' : 'border-border/60 hover:scale-105'}`}
                  style={{ backgroundColor: c.name === 'Eraser' ? '#f1f5f9' : c.hex }}
                  title={c.name}
                >
                  {c.name === 'Eraser' && <span className="text-[10px] mix-blend-multiply opacity-60">🧽</span>}
                  {c.name === 'Highlighter' && <span className="text-[10px] drop-shadow-sm brightness-125">🖍️</span>}
                </button>
              ))}
            </div>
            
            <div className="w-px h-6 bg-border/60 mx-1 hidden lg:block" />
            
            {/* Stroke Width Slider */}
            <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-muted-foreground mx-2 bg-background p-1.5 px-3 rounded-lg border border-border/60 shadow-sm">
              <span className="text-[10px]">Thin</span>
              <input 
                type="range" 
                min="1" max="15" 
                value={lineWidth} 
                onChange={e => setLineWidth(Number(e.target.value))}
                className="w-16 sm:w-20 accent-primary"
              />
              <span className="text-[10px]">Thick</span>
            </div>

            <div className="w-px h-6 bg-border/60 mx-1 hidden sm:block" />

            {/* Background Style Toggle */}
            <div className="flex bg-background rounded-lg border border-border/60 shadow-sm p-1 gap-1">
              {BACKGROUNDS.map(b => (
                <button
                  key={b.id}
                  onClick={() => setBgStyle(b.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded shrink-0 transition-all
                    ${bgStyle === b.id ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-accent text-muted-foreground'}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 mr-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={undo} disabled={historyStep <= 0} title="Undo (Ctrl+Z)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={redo} disabled={historyStep >= history.length - 1} title="Redo (Ctrl+Y)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={clearCanvas} className="font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive h-8 border-border/60">
              Clear
            </Button>
            <Button size="sm" onClick={saveCanvas} className="font-semibold shadow-sm h-8 px-4">
              💾 Export
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          className="flex-1 rounded-xl overflow-hidden border-2 border-border/80 shadow-inner relative touch-none cursor-crosshair transition-colors duration-500"
          style={getCanvasStyle()}
        >
          <canvas
            ref={canvasRef}
            width={2400} // Ultra high resolution internal canvas
            height={1350}
            className="absolute top-0 left-0 w-full h-full"
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
