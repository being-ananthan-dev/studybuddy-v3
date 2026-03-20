import { ref, push, onValue, serverTimestamp, query, limitToLast } from 'firebase/database'
import { rtdb } from './firebase.config'

export function sendMessage(room, user, text) {
  const messagesRef = ref(rtdb, `rooms/${room}/messages`)
  return push(messagesRef, {
    text,
    uid: user.uid,
    displayName: user.displayName || 'Student',
    photoURL: user.photoURL || null,
    timestamp: serverTimestamp()
  })
}

export function subscribeToMessages(room, callback) {
  const messagesRef = query(ref(rtdb, `rooms/${room}/messages`), limitToLast(100))
  return onValue(messagesRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) return callback([])
    
    // Convert object of objects into sorted array
    const msgs = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    
    callback(msgs)
  })
}
