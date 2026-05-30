import { useState, useEffect } from 'react'
import { ref, set, onValue, update } from 'firebase/database'
import { database } from '../config/firebase'

function Tournament() {
  const [tournamentActive, setTournamentActive] = useState(false)
  const [tournamentStarted, setTournamentStarted] = useState(false)
  const [activeUpdateField, setActiveUpdateField] = useState('checkIn1')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load tournament status and listen for real-time updates
  useEffect(() => {
    try {
      const tournamentRef = ref(database, 'tournament')
      
      // Set up real-time listener
      const unsubscribe = onValue(tournamentRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          setTournamentActive(data.isActive || false)
          setTournamentStarted(data.hasStarted || false)
          setActiveUpdateField(data.activeUpdateField || 'checkIn1')
        } else {
          setTournamentActive(false)
          setTournamentStarted(false)
          setActiveUpdateField('checkIn1')
        }
        setLoading(false)
        setError(null)
      }, (error) => {
        setError('Failed to connect to database. Check your connection.')
        console.error('Firebase error:', error)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (err) {
      setError('Failed to initialize database connection')
      console.error('Error:', err)
      setLoading(false)
    }
  }, [])

  const handleStartTournament = async () => {
    try {
      const tournamentRef = ref(database, 'tournament')
      await set(tournamentRef, {
        isActive: true,
        hasStarted: false,
        participants: [],
        activeUpdateField: 'checkIn1'
      })
      setError(null)
    } catch (err) {
      setError('Failed to start tournament')
      console.error('Error:', err)
    }
  }

  const handleBeginTournament = async () => {
    try {
      const tournamentRef = ref(database, 'tournament')
      await update(tournamentRef, { isActive: false, hasStarted: true })
      setError(null)
    } catch (err) {
      setError('Failed to begin tournament')
      console.error('Error:', err)
    }
  }

  const handleResetTournament = async () => {
    try {
      const tournamentRef = ref(database, 'tournament')
      await set(tournamentRef, {
        isActive: false,
        hasStarted: false,
        participants: [],
        activeUpdateField: 'checkIn1'
      })
      setError(null)
    } catch (err) {
      setError('Failed to reset tournament')
      console.error('Error:', err)
    }
  }

  const handleUpdateFieldChange = async (event) => {
    const nextField = event.target.value

    try {
      const tournamentRef = ref(database, 'tournament')
      await update(tournamentRef, { activeUpdateField: nextField })
      setActiveUpdateField(nextField)
      setError(null)
    } catch (err) {
      setError('Failed to update the active field')
      console.error('Error:', err)
    }
  }

  if (loading) {
    return (
      <div className="tournament-container">
        <h2>Tournament</h2>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="tournament-container">
      <h2>Tournament</h2>

      {error && <div className="error-message">{error}</div>}

      {!tournamentActive && !tournamentStarted ? (
        <div className="tournament-start">
          <p>No tournament is currently active.</p>
          <button className="btn btn-primary" onClick={handleStartTournament}>
            Start Sign-ups
          </button>
        </div>
      ) : (
        <div className="tournament-active">
          <div className="tournament-status">
            <h3>Sign-ups are open!</h3>
          </div>

          <div className="tournament-field-control">
            <label htmlFor="activeUpdateField">Updates go to:</label>
            <select
              id="activeUpdateField"
              value={activeUpdateField}
              onChange={handleUpdateFieldChange}
            >
              <option value="checkIn1">Check in 1</option>
              <option value="checkIn2">Check in 2</option>
              <option value="checkIn3">Check in 3</option>
              <option value="endResult">End result</option>
            </select>
          </div>

          <button className="btn btn-danger" onClick={handleBeginTournament}>
            Start Tournament
          </button>
        </div>
      )}

      {!tournamentActive && tournamentStarted && (
        <div className="tournament-active">
          <div className="tournament-status">
            <h3>Tournament has started!</h3>
          </div>


          <p>Check the standings page to see the scoreboard.</p>

          <button className="btn btn-danger" onClick={handleResetTournament}>
            Reset Tournament
          </button>
        </div>
      )}
    </div>
  )
}

export default Tournament
