const express = require('express')
const app = express()
const WSServer = require('express-ws')(app)
const aWss = WSServer.getWss()

const PORT = process.env.PORT || 5000

app.ws('/', (ws, req) => {
  ws.send('Successful connection')

  ws.on('message', (msg) => {
    msg = JSON.parse(msg)

    switch (msg.method) {
      case 'CONNECTION':
        connectionHandler(ws, msg)
    }
  })
})

const connectionHandler = (ws, msg) => {
  ws.id = msg.id
  broadcastConnection(ws, msg)
}
const broadcastConnection = (ws, msg) => {
  const { id, username } = msg

  aWss.clients.forEach(client => {
    if (client.id === id) {
      client.send(`User ${username} connected`)
    }
  })
}

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))
