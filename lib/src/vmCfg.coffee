
fs = require 'fs'

save = (vmCfg, cb) ->
  imgs = []

  for n in vmCfg.hardware.hds
    if      typeof n is 'string'
      imgs.push n
    else if typeof n is 'object'
      imgs.push n.name
      
  vmCfg.hardware.hds = imgs

  fs.writeFile "vmConfigs/#{vmCfg.name}.json", JSON.stringify(vmCfg), (e) ->
    if e is null or e is undefined
      cb {status:'success'}
    else
      cb {status:'error'}

open = (vmName, cb) ->
  fs.readFile "vmConfigs/#{vmName}.json", (e, cfg) ->
    if e is null or e is undefined
      cb {status:'success', data:JSON.parse(cfg)}
    else
      cb {status:'error', data:undefined}

exports.save = save
exports.open = open