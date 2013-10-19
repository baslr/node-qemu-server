exec = require('child_process').exec

version = '0.0.0'

exec 'qemu-system-x86_64 --version', (e, stdout, sterr) ->
  version = stdout.slice(22,27)
  
module.exports.getVersion = -> version
