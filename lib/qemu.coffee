
Vm     = require('./src/vm').Vm
Image  = require('./src/image').Image
parser = require('./src/parser')
vmConf = require('./src/vmCfg')

exports.Vm    = Vm
exports.Image = Image

#
# @call   cfg, cb
#
# @return cb
createImage = (cfg, cb) ->
  img = new Image cfg
  img.create cb

#
# @call   vmCfg, cb
# 
# @return cb ret, new Vm Object
#
createVm = (vmCfg, cb) ->
  if      typeof vmCfg is 'string'
    vmName = vmCcfg
    cb {status:'success'}, new Vm vmName                                        # name
  else if typeof vmCfg is 'object'
    vm = new Vm vmCfg.name                                                      # new vm with its name
    parser.vmCfgToArgs vmCfg, (ret, args) ->                                    # call parser to parse config to qemu process start arguments 
      console.log ret
      if ret.status is 'success'
        vm.setArgs args
        vmConf.save vmCfg, (ret) ->
          if ret.status is 'success'
            cb {status:'success'}, vm
          else
            cb ret, undefined
            
      else
        cb ret, undefined

exports.createVm    = createVm
exports.createImage = createImage
