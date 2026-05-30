import { useEffect, useMemo, useState } from 'react'
import { get, ref, onValue, update } from 'firebase/database'
import { database } from '../config/firebase'

const UPDATE_FIELD_LABELS = {
  checkIn1: 'Check in 1',
  checkIn2: 'Check in 2',
  checkIn3: 'Check in 3',
  endResult: 'End result',
}

const STANDINGS_FIELDS = [
  { key: 'start', label: 'Start' },
  { key: 'checkIn1', label: 'Check in 1' },
  { key: 'checkIn2', label: 'Check in 2' },
  { key: 'checkIn3', label: 'Check in 3' },
  { key: 'endResult', label: 'End result' },
]

function Standings() {
  const [hasStarted, setHasStarted] = useState(false)
  const [participants, setParticipants] = useState([])
  const [activeUpdateField, setActiveUpdateField] = useState('checkIn1')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedParticipantIndex, setSelectedParticipantIndex] = useState(null)
  const [updateValue, setUpdateValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    try {
      const tournamentRef = ref(database, 'tournament')

      const unsubscribe = onValue(tournamentRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          setHasStarted(Boolean(data.hasStarted))
          setParticipants(data.participants || [])
          setActiveUpdateField(data.activeUpdateField || 'checkIn1')
        } else {
          setHasStarted(false)
          setParticipants([])
          setActiveUpdateField('checkIn1')
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

  const activeUpdateLabel = useMemo(() => {
    return UPDATE_FIELD_LABELS[activeUpdateField] || 'Current round'
  }, [activeUpdateField])

  const selectedParticipant =
    selectedParticipantIndex === null ? null : participants[selectedParticipantIndex] || null

  const closeEditor = () => {
    setSelectedParticipantIndex(null)
    setUpdateValue('')
    setSaving(false)
  }

  const openEditor = (participant, index) => {
    setSelectedParticipantIndex(index)
    setUpdateValue(participant?.[activeUpdateField] || '')
    setSuccessMessage('')
    setError(null)
  }

  const handleSaveSaldo = async (event) => {
    event.preventDefault()

    if (selectedParticipantIndex === null) {
      return
    }

    if (updateValue.trim() === '') {
      setError('Please enter a saldo value.')
      return
    }

    setSaving(true)

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
      setSuccessMessage(`${currentParticipants[participantIndex].name} updated for ${UPDATE_FIELD_LABELS[currentField] || 'the current round'}.`)
      closeEditor()
    } catch (err) {
      setError('Failed to update saldo.')
      console.error('Error:', err)
    } finally {
      setSaving(false)
    }
  }

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
      {successMessage && <div className="success-message">{successMessage}</div>}

      {!hasStarted ? (
        <p>Tournament has not started yet.</p>
      ) : participants.length === 0 ? (
        <p>No participants available.</p>
      ) : (
        <div className="participants-list">
          <h3>Scoreboard</h3>
          <p className="update-target-note">
            Update people directly here for: <strong>{activeUpdateLabel}</strong>
          </p>
          <table className="participants-table">
            <thead>
              <tr>
                <th>Name</th>
                {STANDINGS_FIELDS.map((field) => (
                  <th key={field.key}>{field.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, index) => (
                <tr key={`${participant.name}-${index}`}>
                  <td>{participant.name}</td>
                  {STANDINGS_FIELDS.map((field) => {
                    const isActiveField = field.key === activeUpdateField

                    return (
                      <td key={field.key} className={isActiveField ? 'standings-edit-cell' : ''}>
                        {isActiveField ? (
                          <button
                            type="button"
                            className="standings-cell-button"
                            onClick={() => openEditor(participant, index)}
                            aria-label={`Edit ${participant.name} for ${field.label}`}
                            title={`Edit ${participant.name}`}
                          >
                            <span className="standings-cell-value">{participant[field.key] || '-'}</span>
                            <span className="edit-icon-button" aria-hidden="true">
                              ✎
                            </span>
                          </button>
                        ) : (
                          <span className="standings-cell-value">{participant[field.key] || '-'}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedParticipant && (
        <div className="score-edit-backdrop" role="presentation" onClick={closeEditor}>
          <div
            className="score-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="score-edit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="score-edit-title">Update saldo</h3>
            <p className="score-edit-participant">
              Contestant: <strong>{selectedParticipant.name}</strong>
            </p>
            <p className="score-edit-round">
              Round: <strong>{activeUpdateLabel}</strong>
            </p>

            <form className="score-edit-form" onSubmit={handleSaveSaldo}>
              <label htmlFor="standingsSaldo">Saldo</label>
              <input
                id="standingsSaldo"
                type="text"
                value={updateValue}
                onChange={(event) => setUpdateValue(event.target.value)}
                placeholder="Enter saldo"
                maxLength="50"
                autoFocus
              />

              <div className="score-edit-actions">
                <button type="button" className="btn" onClick={closeEditor}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-secondary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Standings
