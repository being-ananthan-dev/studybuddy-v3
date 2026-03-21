export function startSpeechRecognition(onResult, onError) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition
  if (!SR) { 
    onError('Your browser does not support Speech Recognition. Please try Chrome or Edge.')
    return null 
  }
  const recognition = new SR()
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'en-US'
  recognition.onresult = (e) => { const t = e.results[0][0].transcript; onResult(t) }
  recognition.onerror = (e) => onError(e.error)
  recognition.start()
  return recognition
}

export function synthesizeSpeech(text) {
  if (!window.speechSynthesis) return
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 1; u.pitch = 1; u.lang = 'en-US'
  window.speechSynthesis.speak(u)
}
