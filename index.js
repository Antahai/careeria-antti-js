// Express.js palvelin //
const path = require('path')
const express = require('express')
const fs = require('fs').promises

const app = express()

// hae data 
app.get('/api/content/:page', async (req, res) => {
  try{
    const data = await fs.readFile('./' + req.params.page + '.json', 'utf-8')
    res.json(data).end()
  } catch (e){
    console.log('error in getting page data', e)
    res.status(400).send('Bad request')
  }
    })

 // Pinkoodin lukeminen txt tiedostosta pelvelimelta ja lähettäminen selaimelle   
 app.get('/api/getpin', async (req, res) => {
    try {
        // Read the content of the text file
        const savedPin = await fs.readFile('./pin.txt', 'utf-8')
        
        // Send the file content as the response
        res.json(savedPin)
    } catch (error) {
        console.error('Error reading file:', error)
        res.status(500).send('Internal Server Error')
    }
    })

//-------------------------------------------------------
// Tehdään polkumääritys public kansioon 
const polku = path.join(__dirname, './public')

// Sanotaan että em. polussa on tiedostosisältö jota palvelin käyttää kun se saa http requestin
app.use(express.static(polku))

app.listen(3004, () => {
    console.log('Server is up on port 3004.')
})