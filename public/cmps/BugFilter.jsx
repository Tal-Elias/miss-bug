const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetfilterBy }) {
  const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

  useEffect(() => {
    onSetfilterBy(filterByToEdit)
  }, [filterByToEdit])

  function handleChange({ target }) {
    const field = target.name
    let value = target.value

    switch (target.type) {
      case 'number':
      case 'range':
        value = +value || ''
        break

      case 'checkbox':
        value = target.checked
        break

      default:
        break
    }

    setFilterByToEdit((prevFilterBy) => ({ ...prevFilterBy, [field]: value }))
  }

  function onSubmitFilter(ev) {
    ev.preventDefault()
    onSetfilterBy(filterByToEdit)
  }

  const { txt, minSeverity } = filterByToEdit
  return (
    <section className="bug-filter">
      <h2>Filter Our Bugs</h2>

      <form onSubmit={onSubmitFilter}>
        <label htmlFor="txt">Text:</label>
        <input
          value={txt}
          onChange={handleChange}
          name="txt"
          id="txt"
          type="text"
          placeholder="By Text"
        />

        <label htmlFor="minSeverity">Min severity:</label>
        <input
          value={minSeverity}
          onChange={handleChange}
          type="number"
          name="minSeverity"
          id="minSeverity"
          placeholder="By Severity"
        />

        <button>Filter Bugs</button>
      </form>
    </section>
  )
}
