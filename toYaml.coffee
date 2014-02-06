fs   = require 'fs'
yaml = require 'js-yaml'

files = []

for file in fs.readdirSync './vmConfigs'
  files.push file if 0 < file.search /\.json/

for file in files
  jsonObj = require "./vmConfigs/#{file}"
  ymlObj  = yaml.safeDump jsonObj
  fileName = file.split '.'
  fileName.pop()
  fileName = fileName.join '.'
  fs.writeFileSync "./vmConfigs/#{fileName}.yml", ymlObj
