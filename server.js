const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bruinMessenger = require('./app')
const bodyParser = require('body-parser')
const morgan = require('morgan')

// set the view engine to handlebars
app.use(express.static('public'))
app.set('view engine', 'hbs')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// logging
app.use(morgan('combined'))

// include session middleware
app.use(bruinMessenger.session)

// Register our bruinMessenger routes
app.use('/', bruinMessenger.router)

// 404 for all unregistered routes
app.use((req, res, next) => {
  res.status(404).render('404')
})

/**
 * Set up the ioServer and listen on port `port`
 */

 bruinMessenger.ioServer(app).listen(port, ()=> {
 	console.log("Bruin messenger listening on port",port);
 });