
import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'

const BASE_URL = '/api/bug/'
// const STORAGE_KEY = 'bugDB'

// _createBugs()

export const bugService = {
    query,
    get,
    save,
    remove,
    getEmptyBug,
    getDefaultFilter,
    exportToPdf,
}

function query(filterBy, sortBy) {
    const filterSortBy = { ...filterBy, ...sortBy }
    return axios.get(BASE_URL, { params: filterSortBy })
        .then(res => res.data)
}

function get(bugId) {
    return axios.get(BASE_URL + bugId).then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId).then(res => res.data)
}

function save(bug) {
    const method = bug._id ? 'put' : 'post'
    return axios[method](BASE_URL, bug).then(res => res.data)

    // if (bug._id) return axios.put(BASE_URL, bug).then(res => res.data)
    // else return axios.post(BASE_URL, bug).then(res => res.data)

    // const url = BASE_URL + 'save'
    // let queryParams = `?title=${bug.title}&severity=${bug.severity}&description=${bug.description}`
    // if (bug._id) queryParams += `&_id${bug._id}`
    // return axios.get(url + queryParams).then(res => res.data)
}

function getEmptyBug(title = '', severity = '', description = '') {
    return { _id: '', title, severity, description, createdAt: Date.now() }
}

function getDefaultFilter() {
    return {
        txt: '',
        minSeverity: '',
        labels: '',
        pageIdx: 0
    }
}

function exportToPdf() {
    return axios.get(BASE_URL + 'export', { responseType: 'blob' }).then((res) => {
        // Create a Blob from the response data
        const blob = new Blob([res.data], { type: 'application/pdf' })

        // Create a temporary URL for the Blob
        const url = window.URL.createObjectURL(blob)

        // Create a link element to trigger the download
        const a = document.createElement('a')
        a.href = url
        a.download = 'SaveTheBugs.pdf'
        a.click()

        // Release the object URL when done
        window.URL.revokeObjectURL(url)
    })
}

function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (!bugs || !bugs.length) {
        bugs = [
            {
                title: "Infinite Loop Detected",
                severity: 4,
                _id: "1NF1N1T3"
            },
            {
                title: "Keyboard Not Found",
                severity: 3,
                _id: "K3YB0RD"
            },
            {
                title: "404 Coffee Not Found",
                severity: 2,
                _id: "C0FF33"
            },
            {
                title: "Unexpected Response",
                severity: 1,
                _id: "G0053"
            }
        ]
        utilService.saveToStorage(STORAGE_KEY, bugs)
    }
}
