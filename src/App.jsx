import { useState } from 'react'
import Navigation from './components/Navigation'
import RulesDisplay from './components/RulesDisplay'
import Tournament from './components/Tournament'
import Standings from './components/Standings'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('rules')

  return (
    <div className="app-container">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'rules' && <RulesDisplay />}
        {currentPage === 'tournament' && <Tournament />}
        {currentPage === 'standings' && <Standings />}
      </main>
    </div>
  )
}

export default App
