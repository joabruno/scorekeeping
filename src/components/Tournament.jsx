import { useState, useEffect } from 'react'
import { ref, set, get, onValue, update } from 'firebase/database'
import { database } from '../config/firebase'
import JoinForm from './JoinForm'

function Tournament() {
  const [tournamentActive, setTournamentActive] = useState(false)
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
          setParticipants(data.participants || [])
        } else {
          setTournamentActive(false)
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
      await set(tournamentRef, { isActive: true, participants: [] })
      setError(null)
    } catch (err) {
      setError('Failed to start tournament')
      console.error('Error:', err)
    }
  }

  const handleEndTournament = async () => {
    try {
      const tournamentRef = ref(database, 'tournament')
      await set(tournamentRef, { isActive: false, participants: [] })
      setError(null)
    } catch (err) {
      setError('Failed to end tournament')
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

      {!tournamentActive ? (
        <div className="tournament-start">
          <p>No tournament is currently active.</p>
          <button className="btn btn-primary" onClick={handleStartTournament}>
            Start Sign-ups
          </button>
        </div>
      ) : (
        <div className="tournament-active">
          <div className="tournament-status">
            <h3>Tournament is Active!</h3>
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

          <button className="btn btn-danger" onClick={handleEndTournament}>
            Start Tournament
          </button>
        </div>
      )}
    </div>
  )
}

export default Tournament
