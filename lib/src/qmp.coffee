
net       = require 'net'
vmHandler = require '../vmHandler'

class Qmp
  constructor:(@vmName) ->
    @socket = undefined
    @port   = undefined
    @dataCb = undefined

  connect: (port, cb) ->
    if      typeof port is 'function'
      cb = port
    else if typeof port is 'number'
      @port = port

    console.log "QMP: try to connect to VM #{@vmName} with port #{@port}"
      
    setTimeout =>                                                               # give the qemu process time to start
      @socket = net.connect @port
      
      @socket.on 'connect', =>
        console.log "qmp connected"
        @socket.write '{"execute":"qmp_capabilities"}'
        cb status:'success'
        
      @socket.on 'data', (data) =>
        jsons = data.toString().split '\r\n'
        jsons.pop()                                                             # remove last ''
  
        for json in jsons
          try
            parsedData = JSON.parse json.toString()
            if parsedData.event? then event = parsedData.event else event = undefined

            console.log " - - - QMP-START-DATA - - -"
            console.dir  parsedData
            console.log " - - - QMP-END-DATA - - -"
            
            if parsedData.QMP?.version? and parsedData.QMP?.capabilities?
               parsedData.timestamp = new Date().getTime()
               event                = 'START' 
            
            if parsedData.timestamp? and event?
              if vmHandler[event]?
                console.log "QMP: call vmHandler[#{event}] for VM #{@vmName}"
                vmHandler[event] @vmName
            
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
#               console.log "no callback defined:"
#               console.dir parsedData
          catch e
            console.error "cant parse returned json, Buffer is:"
            console.error  json.toString()
            console.error "error is:"
            console.dir    e
  
      @socket.on 'error', (e) =>
        if e.message is 'This socket has been ended by the other party'
          console.log 'qemu closed connection'
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