
http       = require 'http'
nodeStatic = require 'node-static'

webServer  = undefined

module.exports.start = ->
  staticS = new nodeStatic.Server "./public"
  
  webServer  = http.createServer()
  webServer.listen 4224, '0.0.0.0'

  webServer.on 'error', (e) ->
    console.error "webServer error:"
    console.dir    e

  webServer.on 'request', (req, res) ->
    if  -1 is req.url.search '/socket.io/1'                                       # request to us
      staticS.serve req, res                                                    # we only serve files, all other stuff via websockets

module.exports.getHttpServer = ->
  return webServer