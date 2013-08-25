fs       = require 'fs'
qmpPorts = require "#{process.cwd()}/config/qmpPorts.json"
vncPorts = require "#{process.cwd()}/config/vncPorts.json"

module.exports.getFreeQMPport = ->
  for port,used of qmpPorts
    if ! used
      qmpPorts[port] = true
      saveConfigs()
      return Number port

module.exports.getFreeVNCport = ->
  for port,used of vncPorts
    if ! used
      vncPorts[port] = true
      saveConfigs()
      return Number port

# Help function
saveConfigs = ->
  fs.writeFileSync 'config/qmpPorts.json', JSON.stringify qmpPorts
  fs.writeFileSync 'config/vncPorts.json', JSON.stringify vncPorts


module.exports.getIsoFiles = ->
  isoFiles = fs.readdirSync "#{process.cwd()}/isos/"
  isos     = []
  for isoName in isoFiles
    if 0 < isoName.search /\.iso$/
      isos.push isoName
  return isos


module.exports.getDiskFiles = ->
  diskFiles = fs.readdirSync "#{process.cwd()}/disks/"
  disks     = []
  for diskName in diskFiles
    if 0 < diskName.search /\.img$/
      disks.push diskName
  return disks


module.exports.getVmConfigs = ->
  vmFiles = fs.readdirSync "#{process.cwd()}/vmConfigs"
  vms     = []
  for vmName in vmFiles
    if 0 < vmName.search /\.json$/
      vms.push vmName
  return vms


# ls #{process.cwd()}/isos/*.iso|sort -f
