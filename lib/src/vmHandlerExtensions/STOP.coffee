
socketServer = require '../../socketServer'

module.exports = (vm) ->
  console.log "vmHandler Extension received STOP event"

  vm.cfg.status = 'paused'
  vm.saveConfig()
  socketServer.toAll 'set-vm-status', vm.name, 'paused'
  socketServer.toAll 'msg', {type:'success', msg:"VM #{vm.name} paused."}
