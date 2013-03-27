
fs = require 'fs'

save = (vmCfg, cb) ->
  imgs = []

  for n in vmCfg.hardware.hds
    if      typeof n is 'string'
      imgs.push n
    else if typeof n is 'object'
      imgs.push n.name
      
  vmCfg.hardware.hds = imgs
  
  fs.open "vmConfigs/#{vmCfg.name}.json", 'w', (e, fd) ->
    buff = new Buffer JSON.stringify vmCfg
    fs.write fd, buff, 0, buff.length, 0, (e, w, b) ->
      if e is null or e is undefined
        cb {status:'success'}

exports.save = save