// Express.js palvelin //
const path = require('path')
const express = require('express')
const fs = require('fs').promises
const app = express()

// hae data 
app.get('/api/content/:page', async (req, res) => {
  try{
    const data = await fs.readFile('./data/' + req.params.page + '.json', 'utf-8')
    res.json(data).end()
  } catch (e){
    console.log('error in getting page data', e)
    res.status(400).send('Bad request')
  }
    })

// Tehdään polkumääritys public kansioon 
const polku = path.join(__dirname, './public')

// Sanotaan että em. polussa on tiedostosisältö jota palvelin käyttää kun se saa http requestin
app.use(express.static(polku))

app.listen(3004, () => {
    console.log('Server (Careeria js basic) is up on port 3004.')
})