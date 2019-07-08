require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')

const MOVIEDEX = require('./moviedex.json')

const app = express()

const morganSetting = process.env.NODE.ENV === 'production' ? 'tiny' : 'common'
app.use(morganSetting);
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    console.log('apiToken: ', apiToken);
    const authToken = req.get('Authorization')
    console.log('authToken: ', authToken);

    //if (!authToken || authToken.split(' ')[1] !== apiToken) {
        //I had to change above for some reason and I don't know why, it was working before
    if (!authToken || authToken !== apiToken) {
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

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
  })

const PORT = process.env.PORT || 8001
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})
