const fs = require('fs')
const path = require('path')

const express = require('express')

const app = express()
const WSServer = require('express-ws')(app)
const aWss = WSServer.getWss()
const cors = require('cors')

const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.ws('/', (ws, req) => {
  ws.send('Successful connection')

  ws.on('message', (msg) => {
    msg = JSON.parse(msg)

    switch (msg.method) {
      case 'CONNECTION':
        connectionHandler(ws, msg)
      case 'DRAW':
        broadcastConnection(ws, msg)
    }
  })
})

const connectionHandler = (ws, msg) => {
  ws.id = msg.id
  broadcastConnection(ws, msg)
}

const broadcastConnection = (ws, msg) => {
  aWss.clients.forEach((client) => {
    if (client.id === msg.id) {
      client.send(JSON.stringify(msg))
    }
  })
}

app.get('/image', (req, res) => {
  try {
    const file = fs.readFileSync(
      path.resolve(__dirname, 'files', `${req.query.id}.jpg`)
    )
    const data = 'data:image/png;base64,' + file.toString('base64')

    return res.status(200).json({ data })
  } catch (e) {
    return res.status(500).json('error')
  }
})

app.post('/image', (req, res) => {
  try {
    const data = req.body.img.replace('data:image/png;base64,', '')

    fs.writeFileSync(
      path.resolve(__dirname, 'files', `${req.query.id}.jpg`),
      data,
      'base64'
    )

    return res.status(200).json({ status: 'OK' })
  } catch (e) {
    return res.status(500).json({ status: 'ERROR' })
  }
})

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))
