import { useEffect, useMemo, useState } from 'react'
import { get, onValue, ref, update } from 'firebase/database'
import { database } from '../config/firebase'

const UPDATE_FIELD_LABELS = {
  checkIn1: 'Check in 1',
  checkIn2: 'Check in 2',
  checkIn3: 'Check in 3',
  endResult: 'End result',
}

function SubmitCheckIn() {
  const [participants, setParticipants] = useState([])
  const [selectedParticipantIndex, setSelectedParticipantIndex] = useState('')
  const [updateValue, setUpdateValue] = useState('')
  const [activeUpdateField, setActiveUpdateField] = useState('checkIn1')
  const [hasStarted, setHasStarted] = useState(false)
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
            setHasStarted(Boolean(data.hasStarted))
            setActiveUpdateField(data.activeUpdateField || 'checkIn1')
          } else {
            setParticipants([])
            setHasStarted(false)
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

  const activeUpdateLabel = useMemo(() => {
    return UPDATE_FIELD_LABELS[activeUpdateField] || 'Current check in'
  }, [activeUpdateField])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (selectedParticipantIndex === '' || updateValue.trim() === '') {
      setError('Please choose your name and enter your saldo.')
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

      const currentField = data.activeUpdateField || activeUpdateField
      const updatedParticipants = currentParticipants.map((participant, index) => {
        if (index !== participantIndex) {
          return participant
        }

        return { ...participant, [currentField]: updateValue.trim() }
      })

      await update(tournamentRef, { participants: updatedParticipants })

      setError(null)
      setSuccessMessage(`${UPDATE_FIELD_LABELS[currentField] || 'Check in'} updated successfully.`)
      setUpdateValue('')
      setSelectedParticipantIndex('')
    } catch (err) {
      setError('Failed to submit check in')
      setSuccessMessage('')
      console.error('Error:', err)
    }
  }

  if (loading) {
    return (
      <div className="standings-container">
        <h2>Submit Check in</h2>
        <p>Loading...</p>
      </div>
    )
  }

  if (!hasStarted) {
    return (
      <div className="standings-container">
        <h2>Submit Check in</h2>
        <p>Tournament has not started yet.</p>
      </div>
    )
  }

  return (
    <div className="standings-container">
      <h2>Submit Check in</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <p className="update-target-note">
        Current update target: <strong>{activeUpdateLabel}</strong>
      </p>

      {participants.length === 0 ? (
        <p>No participants found yet.</p>
      ) : (
        <form className="join-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="publicParticipantName">Contestant:</label>
            <select
              id="publicParticipantName"
              name="publicParticipantName"
              value={selectedParticipantIndex}
              onChange={(event) => setSelectedParticipantIndex(event.target.value)}
              required
            >
              <option value="">Choose your name</option>
              {participants.map((participant, index) => (
                <option key={`${participant.name}-${index}`} value={index}>
                  {participant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="publicSaldo">Saldo:</label>
            <input
              type="text"
              id="publicSaldo"
              name="publicSaldo"
              value={updateValue}
              onChange={(event) => setUpdateValue(event.target.value)}
              placeholder="Enter your saldo"
              maxLength="50"
              required
            />
          </div>

          <button type="submit" className="btn btn-secondary">
            Submit
          </button>
        </form>
      )}
    </div>
  )
}

export default SubmitCheckIn

