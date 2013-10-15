
os = require 'os'

os.type = -> 'linux'

parser = require '../lib/src/parser'
assert = require 'assert'

conf =
  name: 'foo'
  hardware:
    ram: 128
    vgaCard: 'none'
    disk: 'Platte.img'
    iso:  'Platte.iso'
    cpu:
      model: 'host'
      cores:2
      threads:4
      sockets:1
    net:
      mac: 'ab:cd:ef'
      nic: 'virtio'
    usb:
      [
        vendorId:  101
        productId: 911
      ]

  settings:
    vnc: 5900
    qmpPort: 24
    spice: 42
    keyboard: 'de'
    boot: true
    bootDevice: 'iso'
    numa:
      cpuNode: 1
      memNode: 1

args = parser.guestConfToArgs conf

console.dir args.args

process.exit()