
# Bus 005 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
# Bus 004 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
# Bus 003 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
# Bus 002 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
# Bus 001 Device 002: ID 05e3:0610 Genesys Logic, Inc.
# Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
# 01234567890123456789012345678901234567890
# 00000000001111111111222222222233333333334
# host:vendor_id:product_id

# lsusb -v |grep -E '(Bus\ [0-9]{3,3}|iProduct|bInterfaceClass)'
# Bus 004 Device 004: ID 13fd:1240 Initio Corporation
#   iProduct                2 External
#       bInterfaceClass         8 Mass Storage
# Bus 004 Device 008: ID 0529:0001 Aladdin Knowledge Systems HASP v0.06
#   iProduct                2 HASP HL 2.16
#       bInterfaceClass       255 Vendor Specific Class
# Bus 004 Device 007: ID 062a:7223 Creative Labs
#   iProduct                2 Full-Speed Mouse
#       bInterfaceClass         3 Human Interface Device
#       bInterfaceClass         3 Human Interface Device
# Bus 004 Device 006: ID 05ac:9223 Apple, Inc.
#   iProduct                2 (error)
#       bInterfaceClass         3 Human Interface Device
# Bus 004 Device 005: ID 05af:0802 Jing-Mold Enterprise Co., Ltd
#   iProduct                2 USB Keyboard
#       bInterfaceClass         3 Human Interface Device
#       bInterfaceClass         3 Human Interface Device
# Bus 004 Device 003: ID 05ac:9131 Apple, Inc.
#   iProduct                0
#       bInterfaceClass         9 Hub
#       bInterfaceClass         9 Hub
# Bus 004 Device 002: ID 8087:0024 Intel Corp. Integrated Rate Matching Hub
#   iProduct                0
#       bInterfaceClass         9 Hub
# Bus 004 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
#   iProduct                2 EHCI Host Controller
#       bInterfaceClass         9 Hub
# Bus 003 Device 003: ID 0557:2221 ATEN International Co., Ltd Winbond Hermon
#   iProduct                2 (error)
#       bInterfaceClass         3 Human Interface Device
#       bInterfaceClass         3 Human Interface Device
# Bus 003 Device 002: ID 8087:0024 Intel Corp. Integrated Rate Matching Hub
#   iProduct                0
#       bInterfaceClass         9 Hub
# Bus 003 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
#   iProduct                2 EHCI Host Controller
#       bInterfaceClass         9 Hub
# Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
#   iProduct                2 xHCI Host Controller
#       bInterfaceClass         9 Hub
# Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
#   iProduct                2 xHCI Host Controller
#       bInterfaceClass         9 Hub

exec = require('child_process').exec
os   = require 'os'

usbs = [{text:'Test Device.', vendorId:'ffff', productId:'ffff'}]

module.exports.scan = (cb) ->
  if os.type().toLowerCase() isnt 'linux'
    console.log "USB DEVICES only supported under linux."
    cb usbs if cb?
    return
  
  usbs = []
  
  exec "lsusb -v |grep -E '(Bus\ [0-9]{3,3}|iProduct|bInterfaceClass)'", (e, stdout, sterr) ->
    tmpUsbs = []
    cur  = ''
    for line in stdout.split('\n')[0...-1]
      line = line.trim()
      if -1 < line.search(/^Bus\ [0-9]{3}\ Device\ [0-9]{3}\:\ ID\ [a-z0-9]{4}\:[a-z0-9]{4}\ /)
        cur = line
        tmpUsbs[line] = {}
      else
        tmpUsbs[cur][line] = true
    
    for i,n of tmpUsbs
      for j of n
        if j is 'bInterfaceClass         9 Hub'
          delete tmpUsbs[i]
          break
    
    usbs = []
    
    for i,n of tmpUsbs
      usb = {text: i.slice(33).trim(), vendorId:i.substring(23,32).split(':')[0], productId:i.substring(23,32).split(':')[1]}
      for j of n
        usb.text = "#{usb.text}, #{j.slice 26}"
      usbs.push usb
    
    console.log "USB DEVICES:"
    console.dir usbs
    
    cb usbs if cb?

module.exports.getDevices = -> usbs

@scan()
