
define (require, exports, module) ->
  
  ko = require 'ko'
  
  getConf: (withKo = false) ->
    name: ''
    status: if withKo then ko.observable() else ''
    hardware:
      cpu:
        model  : ''
        sockets: ''
        cores:   ''
        threads: ''
      net:
        nic:  ''
        mode: ''
        mac:  ''
    settings:
      vgaCard: ''
      vnc: ''
      spice: ''
      snapshot: ''
      keyboard:''
  getRamConf:     () -> [128,256,512,1024,2048,4096,6144,8192,16384]
  getSocketsConf: () -> (i for i in [1..4])
  getCoresConf:   () -> (i for i in [1..20])
  getThreadsConf: () -> (i for i in [1..20])
  getGraphicsConf:() -> ['none', 'std', 'qxl']
  getNicConf:     () -> ['e1000', 'i82551', 'i82557b', 'i82559er', 'ne2k_pci', 'pcnet', 'rtl8139', 'virtio']
  getKeyboardConf:() -> ['ar', 'da', 'de',  'de-ch', 'en-gb', 'en-us', 'es', 'et', 'fi', 'fo', 'fr', 'fr-be', 'fr-ca', 'fr-ch', 'hr', 'hu', 'is', 'it', 'ja', 'lt', 'lv', 'mk', 'nl', 'nl-be', 'no', 'pl', 'pt', 'pt-br', 'ru', 'sl', 'sv', 'th', 'tr']
