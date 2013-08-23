
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

saveConfigs = ->
  fs.writeFileSync 'config/qmpPorts.json', JSON.stringify qmpPorts
  fs.writeFileSync 'config/vncPorts.json', JSON.stringify vncPorts