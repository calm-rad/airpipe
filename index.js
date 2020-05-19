var crypto = require('crypto')
var duplexify = require('duplexify')
const hyperswarm = require('hyperswarm')

function initiate (topic, opts) {
  const swarm = hyperswarm()
  // look for peers listed under this topic
  var topicBuffer = crypto.createHash('sha256')
    .update(topic)
    .digest()
  swarm.join(topicBuffer, opts)
  return swarm
}

exports.connect = function (topic, cb) {
  const swarm = initiate(topic, {
    lookup: true, // find & connect to peers
    announce: true,
    extensions: [],
    queue: {
      multiplex: true,
    },
  })

  swarm.on('connection', (socket, details) => {
    if (details.peer)
    console.log('[AIRPIPE] connected to', details.peer.host, details.peer.port)
    cb(null, socket)

    // we have received everything
    socket.on('end', function () {
      swarm.leave(topic)
    })
  })
}
