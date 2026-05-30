import { useState, useEffect } from 'react'
import { ref, set, get, onValue, update } from 'firebase/database'
import { database } from '../config/firebase'
import JoinForm from './JoinForm'

function Tournament() {
  const [tournamentActive, setTournamentActive] = useState(false)
  const [tournamentStarted, setTournamentStarted] = useState(false)
  const [participants, setParticipants] = useState([])
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
          setParticipants(data.participants || [])
        } else {
          setTournamentActive(false)
          setTournamentStarted(false)
          setParticipants([])
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
      await set(tournamentRef, { isActive: true, hasStarted: false, participants: [] })
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
      await set(tournamentRef, { isActive: false, hasStarted: false, participants: [] })
      setError(null)
    } catch (err) {
      setError('Failed to reset tournament')
      console.error('Error:', err)
    }
  }

  const handleJoinTournament = async (formData) => {
    try {
      const tournamentRef = ref(database, 'tournament')
      const snapshot = await get(tournamentRef)
      
      if (snapshot.exists()) {
        const data = snapshot.val()
        const updatedParticipants = [...(data.participants || []), formData]
        await update(tournamentRef, { participants: updatedParticipants })
        setError(null)
      }
    } catch (err) {
      setError('Failed to join tournament')
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
            <p className="participant-count">Participants: {participants.length}</p>
          </div>

          <JoinForm onSubmit={handleJoinTournament} />

          <div className="participants-list">
            <h3>Participants ({participants.length})</h3>
            {participants.length === 0 ? (
              <p className="no-participants">No participants yet. Be the first to join!</p>
            ) : (
              <table className="participants-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{participant.name}</td>
                      <td>{participant.saldo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
            <p className="participant-count">Participants locked: {participants.length}</p>
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
