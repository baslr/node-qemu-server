fs         = require 'fs'
http       = require 'http'
nodeStatic = require 'node-static'
vmHandler  = require './vmHandler'


webServer  = undefined

module.exports.start = ->
  staticS = new nodeStatic.Server "./public"
  
  webServer  = http.createServer()
  webServer.listen 4224, '0.0.0.0'

  webServer.on 'error', (e) ->
    console.error "webServer error:"
    console.dir    e

  webServer.on 'request', (req, res) ->
    if   0 is req.url.search '/iso-upload'
      isoName = req.url.split('/').pop()
      console.log "UPLOAD #{isoName}"
      req.pipe fs.createWriteStream "#{process.cwd()}/isos/#{isoName}"
      req.on 'end', ->
        res.end JSON.stringify {status:'ok'}
        vmHandler.newIso isoName
        
    else if -1 is req.url.search '/socket.io/1'                                 # request to us
      staticS.serve req, res                                                    # we only serve files, all other stuff via websockets

module.exports.getHttpServer = ->
  return webServer