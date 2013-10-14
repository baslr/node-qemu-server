
# Bus 005 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
# Bus 004 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
# Bus 003 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
# Bus 002 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
# Bus 001 Device 002: ID 05e3:0610 Genesys Logic, Inc.
# Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
# 01234567890123456789012345678901234567890
# 00000000001111111111222222222233333333334
# host:vendor_id:product_id

exec = require('child_process').exec
os   = require 'os'

usbs = [{text:'Genesys Logic, Inc.', vendorId:'05e3', productId:'0610'}]

module.exports.scan = (cb) ->
  if os.type().toLowerCase() isnt 'linux'
    console.log "USB DEVICES only supported under linux."
    cb usbs if cb?
    return
  
  exec 'lsusb', (e, stdout, sterr) ->
    for u in stdout.split('\n')[0...-1]
      continue if -1 < u.search /root hub$/
      usbs.push { 
                  text      : u.slice(33).trim()
                  vendorId  : u.substring(23,32).split(':')[0]
                  productId : u.substring(23,32).split(':')[1] }
    
    console.log "USB DEVICES:"
    console.dir usbs
    
    cb usbs if cb?

module.exports.getDevices = -> usbs

@scan()
#module.exports.getUsbs()