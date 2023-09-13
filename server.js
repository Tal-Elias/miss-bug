import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { pdfService } from './services/pdf.service.js'
import { userService } from './services/user.service.js'

const app = express()

// Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// Get Bugs (READ)
app.get('/api/bug', (req, res) => {
    const { txt, minSeverity, pageIdx, type, desc } = req.query
    const filterBy = {
        txt: txt || '',
        minSeverity: minSeverity || 0,
        pageIdx: pageIdx ? +pageIdx : undefined
    }
    const sortBy = {
        type,
        desc
    }
    bugService.query(filterBy, sortBy)
        .then(bugs => {
            res.send(bugs)
        })
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

// Add Bug
app.post('/api/bug', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot add bug')

    const { title, severity, description, createdAt, lables } = req.body
    const bug = {
        _id: '',
        title,
        severity: +severity,
        description,
        createdAt,
        lables
    }

    bugService.save(bug, loggedinUser)
        .then(bug => {
            console.log('bug:', bug)
            res.send(bug)
        })
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

// Update Bug
app.put('/api/bug', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot update bug')

    const { _id, title, severity, description, createdAt, lables } = req.body
    const bug = {
        _id,
        title,
        severity: +severity,
        description,
        createdAt,
        lables
    }

    bugService.save(bug, loggedinUser)
        .then(bug => {
            console.log('bug:', bug)
            res.send(bug)
        })
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

// Export to PDF
app.get('/api/bug/export', (req, res) => {
    bugService.query()
        .then(pdfService.buildPDF)
        .then((pdfFileName) => {
            const pdfFilePath = path.join(process.cwd(), pdfFileName)
            // Send the PDF file to the client
            return res.sendFile(pdfFilePath) //SaveTheBugs.pdf
        }).catch(err => {
            loggerService.error('Cannot get Pdf', err)
            res.status(400).send('Cannot get Pdf')
        })
})

// Get Bug (READ)
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    const { visitedBugs = [] } = req.cookies
    if (visitedBugs.length >= 3) {
        return res.status(401).send('Wait for a bit')
    }
    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
        console.log('visitedBugs:', visitedBugs)
        res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 7 })
    }
    bugService.getById(bugId)
        .then(bug => {
            res.send(bug)
        })
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(400).send('Cannot get bug')
        })
})

// Remove Bug (Delete)
app.delete('/api/bug/:bugId', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot delete bug')
    const { bugId } = req.params

    bugService.remove(bugId, loggedinUser)
        .then(() => {
            // res.redirect('/api/bug')
            res.send('Bug removed successfully')
        })
        .catch((err) => {
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})

// Get Users (READ)
app.get('/api/user', (req, res) => {

    userService.query()
        .then(users => {
            res.send(users)
        })
        .catch(err => {
            loggerService.error('Cannot get users', err)
            res.status(400).send('Cannot get users')
        })
})

// Get User (READ)
app.get('/api/user/:userId', (req, res) => {

    const { userId } = req.params

    userService.getById(userId)
        .then(user => {
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot get user', err)
            res.status(400).send('Cannot get user')
        })
})

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.add(credentials)
        .then(user => {
            const loginToken = userService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot signup', err)
            res.status(400).send('Cannot signup')
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Loggedout..')
})

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

app.listen(3030, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:3030/`)
)
