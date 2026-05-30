import { useEffect, useRef, useState } from 'react'
import { onValue, ref } from 'firebase/database'
import Navigation from './components/Navigation'
import RulesDisplay from './components/RulesDisplay'
import Join from './components/Join'
import Tournament from './components/Tournament'
import Standings from './components/Standings'
import SubmitCheckInModal from './components/SubmitCheckInModal'
import { database } from './config/firebase'
import './App.css'

const ADMIN_STORAGE_KEY = 'isAdminUnlocked'
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'change-me'

function App() {
  const [currentPage, setCurrentPage] = useState('rules')
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const hasAutoOpenedCheckInRef = useRef(false)
  const hasAutoOpenedStandingsRef = useRef(false)
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
  })

  const isAdminPage = currentPage === 'join' || currentPage === 'tournament'

  useEffect(() => {
    const tournamentRef = ref(database, 'tournament')

    const unsubscribe = onValue(tournamentRef, (snapshot) => {
      if (!snapshot.exists()) {
        setIsCheckInOpen(false)
        setShowCheckInModal(false)
        hasAutoOpenedCheckInRef.current = false
        return
      }

      const data = snapshot.val()
      const hasStarted = Boolean(data.hasStarted)
      const participants = data.participants || []
      const activeUpdateField = data.activeUpdateField || ''
      const validFields = ['checkIn1', 'checkIn2', 'checkIn3', 'endResult']
      const shouldShowCheckIn = hasStarted && participants.length > 0 && validFields.includes(activeUpdateField)

      if (!hasStarted) {
        hasAutoOpenedStandingsRef.current = false
      } else if (!hasAutoOpenedStandingsRef.current) {
        hasAutoOpenedStandingsRef.current = true
        setCurrentPage((previousPage) => (previousPage === 'rules' ? 'standings' : previousPage))
      }

      setIsCheckInOpen(shouldShowCheckIn)

      if (!shouldShowCheckIn) {
        setShowCheckInModal(false)
        hasAutoOpenedCheckInRef.current = false
        return
      }

      if (!isAdmin && !hasAutoOpenedCheckInRef.current) {
        hasAutoOpenedCheckInRef.current = true
        setShowCheckInModal(true)
      }
    })

    return () => unsubscribe()
  }, [isAdmin])

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const handleUnlockAdmin = (enteredKey) => {
    if (!enteredKey) {
      return { success: false, message: 'Please enter an admin key.' }
    }

    if (enteredKey === ADMIN_KEY) {
      setIsAdmin(true)
      window.sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true')
      return { success: true }
    }

    return { success: false, message: 'Invalid admin key.' }
  }

  const handleLockAdmin = () => {
    setIsAdmin(false)
    window.sessionStorage.removeItem(ADMIN_STORAGE_KEY)

    if (isAdminPage) {
      setCurrentPage('rules')
    }
  }

  const handleCheckInSaved = (message) => {
    setShowCheckInModal(false)
    setToastMessage(message || 'Your check-in has been saved.')
  }

  return (
    <div className="app-container">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isAdmin={isAdmin}
        onUnlockAdmin={handleUnlockAdmin}
        onLockAdmin={handleLockAdmin}
      />
      <main className="main-content">
        {currentPage === 'rules' && <RulesDisplay />}
        {isAdmin && currentPage === 'join' && <Join />}
        {isAdmin && currentPage === 'tournament' && <Tournament />}
        {currentPage === 'standings' && <Standings />}
        {!isAdmin && isAdminPage && <RulesDisplay />}
      </main>
      {isCheckInOpen && !isAdmin && showCheckInModal && (
        <SubmitCheckInModal
          onClose={() => setShowCheckInModal(false)}
          onSuccess={handleCheckInSaved}
        />
      )}
      {toastMessage && <div className="app-toast">{toastMessage}</div>}
    </div>
  )
}

export default App
