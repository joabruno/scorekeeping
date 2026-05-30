import { useRef, useState } from 'react'

function Navigation({ currentPage, setCurrentPage, isAdmin, onUnlockAdmin, onLockAdmin }) {
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminKeyInput, setAdminKeyInput] = useState('')
  const [adminError, setAdminError] = useState('')
  const pressTimerRef = useRef(null)

  const clearLongPressTimer = () => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }

  const startLongPressTimer = () => {
    clearLongPressTimer()
    pressTimerRef.current = window.setTimeout(() => {
      setShowAdminModal(true)
      setAdminError('')
    }, 700)
  }

  const closeAdminModal = () => {
    setShowAdminModal(false)
    setAdminKeyInput('')
    setAdminError('')
    clearLongPressTimer()
  }

  const handleAdminUnlock = () => {
    const result = onUnlockAdmin(adminKeyInput.trim())

    if (result.success) {
      closeAdminModal()
      return
    }

    setAdminError(result.message)
  }

  const handleAdminLock = () => {
    onLockAdmin()
    closeAdminModal()
  }

  return (
    <>
      <nav
        className="navbar"
        onMouseDown={startLongPressTimer}
        onMouseUp={clearLongPressTimer}
        onMouseLeave={clearLongPressTimer}
        onTouchStart={startLongPressTimer}
        onTouchEnd={clearLongPressTimer}
        onTouchCancel={clearLongPressTimer}
      >
        <div className="navbar-container">
          <h1
            className={`navbar-title ${isAdmin ? 'admin-active' : ''}`}
            title="Long press for admin"
          >
            Betting App
          </h1>
        <ul className="navbar-menu">
          <li>
            <button
              className={`nav-link ${currentPage === 'rules' ? 'active' : ''}`}
              onClick={() => setCurrentPage('rules')}
            >
              Rules
            </button>
          </li>
          {isAdmin && (
            <>
              <li>
                <button
                  className={`nav-link ${currentPage === 'join' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('join')}
                >
                  Join
                </button>
              </li>
              <li>
                <button
                  className={`nav-link ${currentPage === 'tournament' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('tournament')}
                >
                  Tournament
                </button>
              </li>
            </>
          )}
          <li>
            <button
              className={`nav-link ${currentPage === 'standings' ? 'active' : ''}`}
              onClick={() => setCurrentPage('standings')}
            >
              Standings
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'update-saldo' ? 'active' : ''}`}
              onClick={() => setCurrentPage('update-saldo')}
            >
              Update Saldo
            </button>
          </li>
        </ul>
      </div>
      </nav>

      {showAdminModal && (
        <div className="admin-modal-backdrop" role="presentation" onClick={closeAdminModal}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="admin-modal-title">Admin Access</h2>

            {!isAdmin ? (
              <>
                <label htmlFor="adminKeyInput">Admin key</label>
                <input
                  id="adminKeyInput"
                  type="password"
                  value={adminKeyInput}
                  onChange={(event) => setAdminKeyInput(event.target.value)}
                  placeholder="Enter key"
                />
                {adminError && <p className="admin-modal-error">{adminError}</p>}
                <button type="button" className="btn btn-primary" onClick={handleAdminUnlock}>
                  Unlock
                </button>
              </>
            ) : (
              <>
                <p className="admin-modal-status">Admin mode is currently enabled.</p>
                <button type="button" className="btn btn-danger" onClick={handleAdminLock}>
                  Lock Admin
                </button>
              </>
            )}

            <button type="button" className="admin-modal-close" onClick={closeAdminModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Navigation
