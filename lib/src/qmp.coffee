
net  = require 'net'

class Qmp
  constructor:(@port) ->
    @socket = undefined
    @dataCb = undefined
    
  shutdown: ->
    @socket.end()
    @socket.destroy()

  connect: (port, cb) ->
    if      typeof port is 'function'
      cb = port
    else if typeof port is 'number'
      @port = port

    console.log "QMP: try to connect to port #{@port}"
      
    setTimeout =>                                                               # give the qemu process time to start
      @socket = net.connect @port
      
      @socket.on 'connect', =>
        console.log "qmp connected"
        @socket.write '{"execute":"qmp_capabilities"}'
        cb()
        
      @socket.on 'data', (data) =>
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
  
      @socket.on 'error', (e) =>
        if e.message is 'This socket has been ended by the other party'
          console.log 'qemu clossed connection'
        else
          console.error 'qmpConnectError try reconnect'
          @connect cb
    , 1000
      
  sendCmd: (cmd, args, cb) ->
    if typeof args is 'function'
      @dataCb = args
      @socket.write JSON.stringify execute:cmd
    else
      @dataCb = cb
      @socket.write JSON.stringify {execute:cmd, arguments: args }

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
  
  balloon: (mem, cb) ->
    @sendCmd 'balloon', {value:mem}, cb
  
exports.Qmp = Qmp