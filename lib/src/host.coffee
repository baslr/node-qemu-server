
os = require 'os'

host = {hostname:'', cpus:0, ram:'', freeRam:'', load:[]}

host.hostname = os.hostname()
host.cpus     = os.cpus().length
host.ram      = os.totalmem()


module.exports = ->
  host.freeRam = os.freemem()
  host.l       = os.loadavg()
  return host