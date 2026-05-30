import { useState } from 'react'

function JoinForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    start: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim() && formData.start.trim()) {
      onSubmit(formData)
      setFormData({ name: '', start: '' })
    }
  }

  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="playerName">Name:</label>
        <input
          type="text"
          id="playerName"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          maxLength="50"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="playerStart">Start:</label>
        <input
          type="text"
          id="playerStart"
          name="start"
          value={formData.start}
          onChange={handleChange}
          placeholder="Your start saldo"
          maxLength="50"
          required
        />
      </div>

      <button type="submit" className="btn btn-secondary">
        Join Tournament
      </button>
    </form>
  )
}

export default JoinForm
