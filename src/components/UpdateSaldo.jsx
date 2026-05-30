import { useEffect, useState } from 'react'
import { get, onValue, ref, update } from 'firebase/database'
import { database } from '../config/firebase'

function UpdateSaldo() {
  const [participants, setParticipants] = useState([])
  const [selectedParticipantIndex, setSelectedParticipantIndex] = useState('')
  const [updateValue, setUpdateValue] = useState('')
  const [activeUpdateField, setActiveUpdateField] = useState('checkIn1')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    try {
      const tournamentRef = ref(database, 'tournament')

      const unsubscribe = onValue(
        tournamentRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val()
            setParticipants(data.participants || [])
            setActiveUpdateField(data.activeUpdateField || 'checkIn1')
          } else {
            setParticipants([])
            setActiveUpdateField('checkIn1')
          }

          setLoading(false)
          setError(null)
        },
        () => {
          setError('Failed to connect to database. Check your connection.')
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      setError('Failed to initialize database connection')
      setLoading(false)
      return undefined
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (selectedParticipantIndex === '' || updateValue.trim() === '') {
      return
    }

    try {
      const tournamentRef = ref(database, 'tournament')
      const snapshot = await get(tournamentRef)

      if (!snapshot.exists()) {
        setError('Tournament data is missing.')
        return
      }

      const data = snapshot.val()
      const currentParticipants = data.participants || []
      const participantIndex = Number(selectedParticipantIndex)

      if (!Number.isInteger(participantIndex) || !currentParticipants[participantIndex]) {
        setError('Selected participant no longer exists.')
        return
      }

      const updatedParticipants = currentParticipants.map((participant, index) => {
        if (index !== participantIndex) {
          return participant
        }

        return { ...participant, [activeUpdateField]: updateValue.trim() }
      })

      await update(tournamentRef, { participants: updatedParticipants })

      setError(null)
      setSuccessMessage(`Updated ${activeUpdateField} successfully.`)
      setUpdateValue('')
      setSelectedParticipantIndex('')
    } catch (err) {
      setError('Failed to update saldo')
      setSuccessMessage('')
      console.error('Error:', err)
    }
  }

  if (loading) {
    return (
      <div className="standings-container">
        <h2>Update Saldo</h2>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="standings-container">
      <h2>Update Saldo</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

        <p className="update-target-note">
          Current update target: <strong>{activeUpdateField === 'checkIn1' ? 'Check in 1' : activeUpdateField === 'checkIn2' ? 'Check in 2' : activeUpdateField === 'checkIn3' ? 'Check in 3' : 'End result'}</strong>
        </p>

      {participants.length === 0 ? (
        <p>No participants found. Add participants in Tournament first.</p>
      ) : (
        <form className="join-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="participantName">Participant:</label>
            <select
              id="participantName"
              name="participantName"
              value={selectedParticipantIndex}
              onChange={(event) => setSelectedParticipantIndex(event.target.value)}
              required
            >
              <option value="">Select your name</option>
              {participants.map((participant, index) => (
                <option key={`${participant.name}-${index}`} value={index}>
                  {participant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="saldo">New value:</label>
            <input
              type="text"
              id="saldo"
              name="saldo"
              value={updateValue}
              onChange={(event) => setUpdateValue(event.target.value)}
              placeholder="Enter new value"
              maxLength="50"
              required
            />
          </div>

          <button type="submit" className="btn btn-secondary">
            Update Saldo
          </button>
        </form>
      )}
    </div>
  )
}

export default UpdateSaldo

