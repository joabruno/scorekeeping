function Navigation({ currentPage, setCurrentPage }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-title">Betting App</h1>
        <ul className="navbar-menu">
          <li>
            <button
              className={`nav-link ${currentPage === 'rules' ? 'active' : ''}`}
              onClick={() => setCurrentPage('rules')}
            >
              Rules
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
          <li>
            <button
              className={`nav-link ${currentPage === 'standings' ? 'active' : ''}`}
              onClick={() => setCurrentPage('standings')}
            >
              Standings
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
