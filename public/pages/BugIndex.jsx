import { utilService } from '../services/util.service.js'
import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugSort } from '../cmps/BugSort.jsx'



const { useState, useEffect, useRef } = React
const { Link } = ReactRouterDOM

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [sortBy, setSortBy] = useState({ type: '', desc: -1 })
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const debouncedSetFilter = useRef(utilService.debounce(onSetfilterBy, 500))
    const [pageCount, setPageCount] = useState(null)

    useEffect(() => {
        loadBugs()
    }, [filterBy, sortBy])

    function loadBugs() {
        bugService.query(filterBy, sortBy).then(data => {
            setBugs(data.bugsToDisplay)
            setPageCount(data.pageCount)
        })
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onSetfilterBy(filterBy) {
        setFilterBy((prevFilterBy) => ({ ...prevFilterBy, ...filterBy }))
    }

    function onChangePageIdx(diff) {
        const nextPageIdx = filterBy.pageIdx + diff
        if (nextPageIdx === pageCount) {
            setFilterBy(prevFilterBy => ({ ...prevFilterBy, pageIdx: 0 }))
        } else if (nextPageIdx === -1) {
            console.log(filterBy.pageIdx)
            setFilterBy(prevFilterBy => ({ ...prevFilterBy, pageIdx: pageCount - 1 }))
        } else setFilterBy(prevFilterBy => ({ ...prevFilterBy, pageIdx: nextPageIdx }))
    }

    function onExportToPdf() {
        bugService.exportToPdf()
    }

    if (!bugs) return <div>Loading...</div>
    return (
        <section className='bug-index'>
            <BugFilter onSetfilterBy={debouncedSetFilter.current} filterBy={filterBy} />
            <h3>Bugs App</h3>
            <main>
                <Link to="/bug/edit">Add Bug ⛐</Link>
                <button className="btn-pdf" onClick={onExportToPdf}>
                    Download PDF
                </button>
                <div className='list-pages'>
                    <BugSort sortBy={sortBy} setSortBy={setSortBy} />
                    <button onClick={() => { onChangePageIdx(-1) }}>-</button>
                    {filterBy.pageIdx + 1}
                    <button onClick={() => { onChangePageIdx(1) }}>+</button>
                    {/* <button onClick={() => { onChangePageIdx(undefined) }}>Cancel pagination</button> */}
                    <BugList bugs={bugs} onRemoveBug={onRemoveBug} />
                </div>
            </main>
        </section>
    )
}
