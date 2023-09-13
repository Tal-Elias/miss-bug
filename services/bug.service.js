import { loggerService } from './logger.service.js'
import { utilService } from './util.service.js'
import fs from 'fs'

export const bugService = {
    query,
    getById,
    remove,
    save
}

const PAGE_SIZE = 4
const bugs = utilService.readJsonFile('data/bug.json')

function query(filterBy, sortBy) {
    let bugsToDisplay = bugs
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugsToDisplay = bugsToDisplay.filter(bug =>
            regExp.test(bug.title) ||
            regExp.test(bug.description) ||
            regExp.test(bug.labels))
    }

    if (filterBy.minSeverity) {
        bugsToDisplay = bugsToDisplay.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    const pageCount = Math.ceil(bugsToDisplay.length / PAGE_SIZE)

    bugsToDisplay = getSortedBugs(bugsToDisplay, sortBy)

    if (filterBy.pageIdx !== undefined) {
        let startIdx = filterBy.pageIdx * PAGE_SIZE
        bugsToDisplay = bugsToDisplay.slice(startIdx, startIdx + PAGE_SIZE)
    }

    const data = { bugsToDisplay, pageCount }
    return Promise.resolve(data)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    return Promise.resolve(bug)
}

function remove(bugId, loggedinUser) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('No Such Bug')
    const bug = bugs[bugIdx]
    if (!loggedinUser.isAdmin &&
        bug.owner._id !== loggedinUser._id) {
        return Promise.reject('Not your bug')
    }
    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bug, loggedinUser) {
    console.log('loggedinUser:', loggedinUser)
    if (bug._id) {
        const bugIdx = bugs.findIndex(currBug => currBug._id === bug._id)
        if (bugs[bugIdx].owner._id !== loggedinUser._id && !loggedinUser.isAdmin) return Promise.reject('Not your Bug')
        bugs[bugIdx] = bug
    } else {
        bug = {
            _id: utilService.makeId(),
            title: bug.title,
            severity: bug.severity,
            owner: loggedinUser
        }
        bugs.unshift(bug)
    }
    return _saveBugsToFile().then(() => bug)
}

function getSortedBugs(bugsToDisplay, sortBy) {
    if (sortBy.type === 'title') {
        bugsToDisplay.sort((b1, b2) => {
            const title1 = b1.title.toLowerCase()
            const title2 = b2.title.toLowerCase()
            return sortBy.desc * title2.localeCompare(title1)
        })
    } else {
        bugsToDisplay.sort(
            (b1, b2) => sortBy.desc * (b2[sortBy.type] - b1[sortBy.type])
        )
    }
    return bugsToDisplay
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 2)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to bugs file', err)
                return reject(err)
            }
            resolve()
        })
    })
}