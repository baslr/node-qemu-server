
# TODO implement ps for linux

fs   = require 'fs'
os   = require 'os'
exec = require('child_process').exec

vncPorts   = {}
qmpPorts   = {}
spicePorts = {}
try
  pids = require "#{process.cwd()}/pids.json"
catch
  pids = {}

vncPorts[Number port]        = false for port in [1..255]
qmpPorts[Number port+15000]  = false for port in [1..255]
spicePorts[Number port+15300]= false for port in [1..255]

module.exports.setToUsed = (proto, port) ->
  switch proto
    when 'qmp'   then qmpPorts[Number port]   = true
    when 'vnc'   then vncPorts[Number port]   = true
    when 'spice' then spicePorts[Number port] = true

module.exports.getFreeQMPport = ->
  for port,used of qmpPorts
    if not used
      @setToUsed 'qmp', port
      return Number port

module.exports.getFreeVNCport = ->
  for port,used of vncPorts
    if not used
      @setToUsed 'vnc', port
      return Number port

module.exports.getFreeSPICEport = ->
  for port,used of spicePorts
    if not used
      @setToUsed 'spice', port
      return Number port


module.exports.getIsoFiles = ->
  isoFiles = fs.readdirSync "#{process.cwd()}/isos/"
  isos     = []
  for isoName in isoFiles
    isos.push isoName if 0 < isoName.search /\.iso$/
  return isos


module.exports.getDiskFiles = ->
  diskFiles = fs.readdirSync "#{process.cwd()}/disks/"
  disks     = []
  for diskName in diskFiles
    disks.push diskName if 0 < diskName.search /\.img$/
  return disks


module.exports.getVmConfigs = ->
  guestConfs = fs.readdirSync "#{process.cwd()}/vmConfigs"
  guests     = []
  for name in guestConfs
    guests.push name if 0 < name.search /\.yml$/
  return guests


module.exports.getVmHandlerExtensions = ->
  filesIn = fs.readdirSync "#{process.cwd()}/lib/src/vmHandlerExtensions"
  files   = {}
  
  files[file.split('.')[0]] = true for file in filesIn
  
  return (i for i of files)


savePids = () -> fs.writeFileSync "#{process.cwd()}/pids.json", JSON.stringify pids

module.exports.setPid = (pid, guestName) ->
  console.log "CONFIG: set pid:#{pid} for #{guestName}"
  pids[pid] = guestName
  
  savePids()

module.exports.removePid = (pid) ->
  return if ! pids[pid]?
  
  delete pids[pid]
  console.log "CONFIG: removed pid:#{pid}"
  savePids()

module.exports.getGuestNameByPid = (pid) -> pids[pid] if pids[pid]?

module.exports.getRunningPids = (cb) ->
  if      'darwin' is os.type().toLowerCase()
    cmd = 'ps ax -o pid,etime,start,lstart,time,comm|grep qemu-system-x86_64'
  else if 'linux' is os.type().toLowerCase()
    cmd = 'ps --no-headers -o pid,etime,start,lstart,time,comm -C qemu-system-x86_64'
  
  exec cmd, (err, stdout, stderr) ->
    return cb [] if err
    
    tmpPids = stdout.trim().split '\n'
    tmpPids.pop() if '' is tmpPids[tmpPids.length-1]
    
    retPids = (Number pid.split(' ')[0] for pid in tmpPids)
    cb retPids
    
    console.log 'running pids found:'
    console.dir retPids

# ls #{process.cwd()}/isos/*.iso|sort -f
