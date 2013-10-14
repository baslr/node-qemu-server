exec = require('child_process').exec

version = '0.0.0'

exec 'qemu-system-x86_64 --version', (e, stdout, sterr) ->
  version = stdout.split('version ')[1].split(',')[0]
  
module.exports.getVersion = -> version
