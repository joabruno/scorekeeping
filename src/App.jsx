import { useState } from 'react'
import Navigation from './components/Navigation'
import RulesDisplay from './components/RulesDisplay'
import Join from './components/Join'
import Tournament from './components/Tournament'
import Standings from './components/Standings'
import UpdateSaldo from './components/UpdateSaldo'
import './App.css'

const ADMIN_STORAGE_KEY = 'isAdminUnlocked'
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'change-me'

function App() {
  const [currentPage, setCurrentPage] = useState('rules')
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
  })

  const isAdminPage = currentPage === 'join' || currentPage === 'tournament'

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
        {currentPage === 'update-saldo' && <UpdateSaldo />}
        {!isAdmin && isAdminPage && <RulesDisplay />}
      </main>
    </div>
  )
}

export default App
