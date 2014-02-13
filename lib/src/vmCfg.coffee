
fs   = require 'fs'
yaml = require 'js-yaml'

save = (vmCfg) ->
  try
    ymlObj  = yaml.safeDump vmCfg
    fs.writeFileSync "#{process.cwd()}/vmConfigs/#{vmCfg.name}.yml", ymlObj
  catch e
    console.error 'save error'
    console.dir    e
    return false
  return true

open = (confName, cb) ->
  try
    conf = yaml.safeLoad fs.readFileSync "#{process.cwd()}/vmConfigs/#{confName}", 'utf8'
  catch e
    console.log 'open error'
    console.dir  e
    return false
  return conf

exports.save = save
exports.open = open
