
net  = require 'net'

class Qmp
  constructor:(@port) ->
    @sock   = undefined
    @dataCb = undefined

  connect: (port, cb) ->
    if      typeof port is 'function'
      cb = port
    else if typeof port is 'number'
      @port = port
      
    setTimeout =>  
      @sock = net.connect @port
      
      @sock.on 'connect', =>
        console.log "qmp connected"
        @sock.write '{"execute":"qmp_capabilities"}'
        cb()
        
      @sock.on 'data', (data) =>
        jsons = data.toString().split '\r\n'
        jsons.pop()                                                             # remove last ''
  
        for json in jsons
          try
            parsedData = JSON.parse json.toString()
            if @dataCb?
              if parsedData.error?
                @dataCb 'error':parsedData.error
              else if parsedData.timestamp?
                continue
              else if parsedData.return?
                if 0 is Object.keys(parsedData.return).length
                  @dataCb status:'success'
                else
                  @dataCb 'data':parsedData.return
              else
                console.error "cant process Data"
                console.error parsedData
              @dataCb = undefined
            else
              console.log "no callback defined:"
              console.dir parsedData
          catch e
            console.error "cant parse returned json, Buffer is:"
            console.error json.toString()
  
      @sock.on 'error', (err) =>
        console.error "qmpConnectError try reconnect"
        @connect cb
    , 100
      
  sendCmd: (cmd, cb) ->
    @dataCb = cb
    @sock.write JSON.stringify execute:cmd
      
  reconnect: (port, cb) ->
    @connect port, cb
    
  ###
  #   QMP commands
  ###
  pause: (cb) ->
    @sendCmd 'stop', cb
    
  reset: (cb) ->
    @sendCmd 'system_reset', cb
    
  resume: (cb) ->
    @sendCmd 'cont', cb
    
  shutdown: (cb) ->
    @sendCmd 'system_powerdown', cb
    
  stop: (cb) ->
    @sendCmd 'quit', cb
  
exports.Qmp = Qmp