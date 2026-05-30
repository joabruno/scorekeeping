import { useEffect, useState } from 'react'
import { get, onValue, ref, update } from 'firebase/database'
import { database } from '../config/firebase'
import JoinForm from './JoinForm'

function Join() {
  const [tournamentActive, setTournamentActive] = useState(false)
  const [tournamentStarted, setTournamentStarted] = useState(false)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const tournamentRef = ref(database, 'tournament')

      const unsubscribe = onValue(
        tournamentRef,
        (snapshot) => {
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
        },
        (dbError) => {
          setError('Failed to connect to database. Check your connection.')
          console.error('Firebase error:', dbError)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      setError('Failed to initialize database connection')
      console.error('Error:', err)
      setLoading(false)
    }
  }, [])

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
        <h2>Join</h2>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="tournament-container">
      <h2>Join</h2>

      {error && <div className="error-message">{error}</div>}

      {!tournamentActive && !tournamentStarted ? (
        <div className="tournament-start">
          <p>No tournament is currently active.</p>
        </div>
      ) : (
        <div className="tournament-active">
          <div className="tournament-status">
            <h3>{tournamentStarted ? 'Tournament has started!' : 'Sign-ups are open!'}</h3>
            <p className="participant-count">
              Participants: {participants.length}
            </p>
          </div>

          {tournamentActive && !tournamentStarted && (
            <JoinForm onSubmit={handleJoinTournament} />
          )}

          {participants.length === 0 ? (
            <p className="no-participants">No participants yet. Be the first to join!</p>
          ) : (
            <div className="participants-list">
              <h3>Participants ({participants.length})</h3>
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
                          <td>{participant.start}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tournamentStarted && (
            <p>Sign-ups are locked. Check the standings page to see the scoreboard.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Join

