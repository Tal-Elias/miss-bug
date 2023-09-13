const { useState, useEffect } = React

export function BugSort({ sortBy, setSortBy }) {

    const [sortByToEdit, setSortByToEdit] = useState({ ...sortBy })

    useEffect(() => {
        setSortBy(sortByToEdit)
    }, [sortByToEdit])

    function handleChange({ target }) {
        const field = target.name
        const value = target.type === 'number' ? +target.value : target.value
        if (field === 'desc') setSortByToEdit(prevSort => ({
            ...prevSort,
            desc: -(prevSort.desc)
        }))
        else setSortByToEdit((prevSort) => ({
            ...prevSort,
            [field]: value,
        }))
    }

    return (
        <form className="bug-sort">
            < select name="type" value={sortByToEdit.type} onChange={handleChange}>
                <option value="default">Sort by</option>
                <option value="title">Title</option>
                <option value="severity">Severity</option>
            </select >
            <label>
                <input
                    type="checkbox"
                    name="desc"
                    checked={sortByToEdit.desc > 0}
                    onChange={handleChange}
                />
                Descending
            </label>
        </form >
    )
}