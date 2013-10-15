conf = []
conf[0] =
  name: 'linux, default, with [boot,vnc,spice]=true +usb'
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
      
conf[1] =
  name: 'linux, default, with [boot,vnc,spice]=false -usb'
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
  settings:
    keyboard: 'de'
    qmpPort: 24
    vnc:   false
    spice: false
    boot:  false
    bootDevice: 'disk'
    numa:
      cpuNode: 1
      memNode: 1
      
conf[2] =
  name: 'default, with [boot,vnc,spice]=false -[usb,net],vga:std'
  hardware:
    ram: 128
    vgaCard: 'std'
    disk: 'Platte.img'
    iso:  'none'
    cpu:
      model: 'host'
      cores:2
      threads:4
      sockets:1
  settings:
    keyboard: 'de'
    qmpPort: 24
    vnc:   false
    spice: false
    boot:  false
    bootDevice: 'disk'
    numa:
      cpuNode: 0
      memNode: 0

module.exports = conf