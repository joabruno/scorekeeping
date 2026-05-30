import { useEffect, useMemo, useState } from 'react'
import { get, onValue, ref, update } from 'firebase/database'
import { database } from '../config/firebase'

const UPDATE_FIELD_LABELS = {
  checkIn1: 'Check in 1',
  checkIn2: 'Check in 2',
  checkIn3: 'Check in 3',
  endResult: 'End result',
}

function SubmitCheckInModal({ onClose, onSuccess }) {
  const [participants, setParticipants] = useState([])
  const [selectedParticipantIndex, setSelectedParticipantIndex] = useState('')
  const [updateValue, setUpdateValue] = useState('')
  const [activeUpdateField, setActiveUpdateField] = useState('checkIn1')
  const [hasStarted, setHasStarted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState('select')
  const [error, setError] = useState('')

  useEffect(() => {
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
      },
      () => {
        setError('Failed to connect to database. Check your connection.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const activeUpdateLabel = useMemo(() => {
    return UPDATE_FIELD_LABELS[activeUpdateField] || 'Current check in'
  }, [activeUpdateField])

  const selectedParticipant =
    selectedParticipantIndex === '' ? null : participants[Number(selectedParticipantIndex)] || null

  const hasSubmittedForActiveRound = (participant) => {
    const value = participant?.[activeUpdateField]
    return value !== undefined && value !== null && String(value).trim() !== ''
  }

  const handleBackToSelect = () => {
    setStep('select')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (selectedParticipantIndex === '') {
      setError('Please choose your name first.')
      setStep('select')
      return
    }

    if (updateValue.trim() === '') {
      setError('Please enter your saldo.')
      return
    }

    setSubmitting(true)

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

      setError('')
      setUpdateValue('')
      onSuccess(`${UPDATE_FIELD_LABELS[currentField] || 'Check in'} has been saved.`)
    } catch (err) {
      setError('Failed to submit check in.')
      console.error('Error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="checkin-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="checkin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkin-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="checkin-modal-title">Submit Check in</h2>
        <p className="checkin-modal-target">
          Active target: <strong>{activeUpdateLabel}</strong>
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : !hasStarted ? (
          <p>Tournament has not started yet.</p>
        ) : participants.length === 0 ? (
          <p>No participants found yet.</p>
        ) : (
          <>
            {step === 'select' ? (
              <div className="checkin-modal-step">
                <p className="checkin-modal-label">Who are you?</p>
                <p className="checkin-modal-legend">
                  <span className="contestant-checkmark legend-checkmark" aria-hidden="true" />
                  = already submitted for this round
                </p>
                <div className="contestant-grid">
                  {participants.map((participant, index) => {
                    const isSelected = selectedParticipantIndex === String(index)
                    const hasSubmitted = hasSubmittedForActiveRound(participant)

                    return (
                      <button
                        key={`${participant.name}-${index}`}
                        type="button"
                        className={`contestant-option ${isSelected ? 'selected' : ''} ${hasSubmitted ? 'submitted' : ''}`}
                        onClick={() => {
                          setSelectedParticipantIndex(String(index))
                          setError('')
                          setStep('amount')
                        }}
                      >
                        {participant.name}
                        {hasSubmitted && <span className="contestant-checkmark" aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <form className="checkin-modal-step" onSubmit={handleSubmit}>
                <p className="checkin-modal-selected">
                  Contestant: <strong>{selectedParticipant?.name || '-'}</strong>
                </p>
                <label htmlFor="checkInAmount">Saldo</label>
                <input
                  type="text"
                  id="checkInAmount"
                  value={updateValue}
                  onChange={(event) => setUpdateValue(event.target.value)}
                  placeholder="Enter your saldo"
                  maxLength="50"
                  required
                />

                <div className="checkin-modal-actions">
                  <button type="button" className="btn" onClick={handleBackToSelect}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-secondary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {error && <p className="checkin-modal-error">{error}</p>}

        <button type="button" className="checkin-modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default SubmitCheckInModal

