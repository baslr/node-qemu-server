
os = require 'os'

osTypeBackup = os.type


resArgs = require './args.json'
parser  = require '../lib/src/parser'
assert  = require 'assert'


test = (conf, i) ->
  describe 'config check', ->
    it conf.name, ->
      
      if 0 is conf.name.search /^linux/
        os.type = -> 'linux'
      else
        os.type = osTypeBackup

      args = parser.guestConfToArgs(conf).args
      console.dir args
      assert.deepEqual args, resArgs[i]


for conf,i in require './confs'
  test conf,i

  

#process.exit()