require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')

const MOVIEDEX = require('./moviedex.json')

const app = express()

app.use(morgan('dev'));
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization')

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({error: 'Unauthorized request'})
    }
    next()

})

function handleGetMovies(req, res) {

    let response = MOVIEDEX
    const { genre, country, avg_vote } = req.query;

    if (genre) {
        response = response.filter(item => item.genre.toLowerCase().includes(genre.toLowerCase()))
    }

    if (country) {
        response = response.filter(item => item.country.toLowerCase().includes(country.toLowerCase()))
    }

    if(avg_vote) {
        let numVote = Number(avg_vote)
        response = response.filter(item => {return item.avg_vote >= numVote} )
    }

    res.json(response)
}

app.get('/movies', handleGetMovies)

const PORT = 8000
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})
