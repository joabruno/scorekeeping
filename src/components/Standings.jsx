import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '../config/firebase'

function Standings() {
  const [hasStarted, setHasStarted] = useState(false)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const tournamentRef = ref(database, 'tournament')

      const unsubscribe = onValue(tournamentRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          setHasStarted(Boolean(data.hasStarted))
          setParticipants(data.participants || [])
        } else {
          setHasStarted(false)
          setParticipants([])
        }

        setLoading(false)
        setError(null)
      }, () => {
        setError('Failed to connect to database. Check your connection.')
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (err) {
      setError('Failed to initialize database connection')
      setLoading(false)
      return undefined
    }
  }, [])

  if (loading) {
    return (
      <div className="standings-container">
        <h2>Standings</h2>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="standings-container">
      <h2>Standings</h2>

      {error && <div className="error-message">{error}</div>}

      {!hasStarted ? (
        <p>Tournament has not started yet.</p>
      ) : participants.length === 0 ? (
        <p>No participants available.</p>
      ) : (
        <div className="participants-list">
          <h3>Scoreboard</h3>
          <table className="participants-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Start</th>
                <th>Check in 1</th>
                <th>Check in 2</th>
                <th>Check in 3</th>
                <th>End result</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, index) => (
                <tr key={`${participant.name}-${index}`}>
                  <td>{participant.name}</td>
                  <td>{participant.start || '-'}</td>
                  <td>{participant.checkIn1 || '-'}</td>
                  <td>{participant.checkIn2 || '-'}</td>
                  <td>{participant.checkIn3 || '-'}</td>
                  <td>{participant.endResult || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Standings
