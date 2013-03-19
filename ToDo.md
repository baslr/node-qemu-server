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
