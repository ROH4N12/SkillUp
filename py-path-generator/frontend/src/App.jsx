import { useState } from 'react'
import './App.css'

function App() {
  const [goal, setGoal] = useState('')
  const [level, setLevel] = useState('beginner')
  const [knownSkills, setKnownSkills] = useState('')
  const [path, setPath] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPath(null)

    const skillsArray = knownSkills.split(',').map(s => s.trim()).filter(s => s.length > 0)

    try {
      const res = await fetch('http://localhost:8000/generate-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          goal,
          level,
          knownSkills: skillsArray
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'An error occurred')
      }

      if (data.path) {
        setPath(data.path)
      } else {
        setError(data.message || 'Could not generate path')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header>
        <div className="logo-sparkle">✨</div>
        <h1>AI Learning Path Generator</h1>
        <p>Enter your goals and background to get a custom roadmap.</p>
      </header>

      <main>
        <section className="form-section">
          <form onSubmit={handleSubmit} className="glass-form">
            <div className="form-group">
              <label htmlFor="goal">Learning Goal</label>
              <input
                type="text"
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Frontend Development, Data Science"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="level">Current Level</label>
              <select id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="skills">Known Skills (comma separated)</label>
              <input
                type="text"
                id="skills"
                value={knownSkills}
                onChange={(e) => setKnownSkills(e.target.value)}
                placeholder="e.g., HTML, CSS, Python"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : 'Generate Path'}
            </button>
          </form>
        </section>

        {error && (
          <div className="error-message">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {path && (
          <section className="path-results">
            <div className="path-header">
              <h2>{path.title}</h2>
              <p className="path-desc">{path.description}</p>
            </div>
            
            <div className="stages">
              {path.stages.map((stage, i) => (
                <div key={i} className="stage-card" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="stage-title">
                    <div className="stage-icon">
                      {i === 0 ? '🌱' : i === 1 ? '🪴' : '🌳'}
                    </div>
                    <h3>{stage.stageName}</h3>
                  </div>
                  <div className="course-list">
                    {stage.courses.length > 0 ? (
                      stage.courses.map((course, j) => (
                         <div key={j} className="course-item">
                           <div className="course-top">
                             <h4>{course.title || course.name}</h4>
                             <span className="domain-badge">{course.domain}</span>
                           </div>
                           <p className="course-level"><strong>Level:</strong> <span className={`level-indicator ${course.level || course.difficulty}`}>{course.level || course.difficulty}</span></p>
                           {course.skills && course.skills.length > 0 && (
                             <div className="skills-tags">
                               {course.skills.map((s, idx) => <span key={idx} className="skill-tag">{s}</span>)}
                             </div>
                           )}
                         </div>
                      ))
                    ) : (
                      <p className="no-courses">No courses found matching this stage.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
