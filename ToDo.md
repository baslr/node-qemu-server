#### different ways to crate an image
    qemu = require './lib/qemu'
    conf = {name:'myImage', size:10}    # 10GiByte

    qemu.createImage conf, (ret) ->
      ret.image                         # image object
      ret.status                        # status

    qImage = new qemu.Image conf
    qImage.create (ret) ->
      if ret.status is 'success'
      # creation ok

    qImage = new qemu.Image()
    qImage.create conf, (ret) ->
      if ret.status is 'success'
      # creation ok



@ToDo


  
vmHandler.scanForRunningVms
  - qmp port scann de ports die belegt sind
  
  
Delete disk
 - click on button
 - client emits delete-disk
 - server trys to delete disk
 - server emits delete-disk
 - client removes it from gui