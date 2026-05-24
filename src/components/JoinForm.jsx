import { useState } from 'react'

function JoinForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    saldo: ''
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
    if (formData.name.trim() && formData.saldo.trim()) {
      onSubmit(formData)
      setFormData({ name: '', saldo: '' })
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
        <label htmlFor="playerSaldo">Saldo:</label>
        <input
          type="text"
          id="playerSaldo"
          name="saldo"
          value={formData.saldo}
          onChange={handleChange}
          placeholder="Your saldo"
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
