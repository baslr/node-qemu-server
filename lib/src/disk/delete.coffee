
fs = require 'fs'

module.exports = (diskName) ->
  try
    fs.unlinkSync "#{process.cwd()}/disks/#{diskName}.img"
    return true
  catch e
    return false
