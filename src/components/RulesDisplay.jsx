import { useState, useEffect } from 'react'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

export default function RulesDisplay() {
  const [rulesHtml, setRulesHtml] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch and parse the rules.md file
    fetch('./rules.md')
      .then(res => res.text())
      .then(text => {
        const html = md.render(text)
        setRulesHtml(html)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading rules:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="loading">Loading rules...</div>
  }

  return (
    <div className="rules-container">
      <div className="rules-content">
        <div 
          className="rules-markdown"
          dangerouslySetInnerHTML={{ __html: rulesHtml }}
        />
      </div>
    </div>
  )
}
