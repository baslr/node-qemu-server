'use strict';

const os     = require('os');
const osType = os.type().toLowerCase();


class Parser {
  constructor() {
    this.args = [ 'qemu-system-x86_64', '-nographic', '-parallel', 'none', '-serial', 'none'];
  } // constructor()

  vmConfToArgs(conf) {

    if      (typeof conf !== 'object')
      throw 'conf must be an object';
    else if (typeof conf.name     !== 'string')
      throw 'conf.name must be a string';
    else if (typeof conf.hardware !== 'object')
      throw 'conf.hardware must be an object';
    else if (typeof conf.settings !== 'object')
      throw 'conf.settings must be an object';

    const hw = conf.hardware;
    const st = conf.settings;

    this.name(conf.name)
    .uuid(conf.uuid)
    .nodefconfig()
    .nodefaults()
    .machine(hw.machine);

    if (st.tablet) this.tablet();
    if (st.mouse)  this.mouse();

    if ('linux' == osType) { this.accel('kvm').kvm(); }

    // ram vga keyboard
    this.ram(     hw.ram)
        .vga(     hw.vga)
        .keyboard(st.keyboard);

    // cpu
    const cpu = hw.cpu;
    this.cpuModel(cpu.model)
        .smp(     cpu.sockets, cpu.cores, cpu.threads);

    // drives
    hw.drives.forEach( (drive) => this.drive(drive.type, drive.path, drive.interface) );

    // qmp vnc spice
                  this.qmp(  st.qmp.port);
    if (st.vnc) { this.vnc(  st.vnc.port);   }
    if (st.spice && osType == 'linux') 
                { this.spice(st.spice.port, st.spice.addr, st.spice.password); }

    // net
    if (hw.net) {
      const net = hw.net;
      this.net(net.macAddr, net.nic, net.mode, net.opts);
    } // if

    if (st.noShutdown) { this.noShutdown(); }
    if (st.noStart)    { this.noStart();    }




    // todo: conf to qemu args



    return this.args;
  } // vmConfToArgs()


  /*
   *  N O  D E F A U L T S
   *  N O  D E F A U L T  C O N F I G
   *  N O  S H U T D O W N
   *  tested
   */
  nodefconfig() { return this.pushArg('-nodefconfig'); }
  nodefaults()  { return this.pushArg('-nodefaults');  }
  noShutdown()  { return this.pushArg('-no-shutdown'); }
  noStart()     { return this.pushArg('-S');           }


  /*
   *  N A M E
   *  U U I D
   *  tested
   */
  name(name) { return this.pushArg('-name', `"${name}"`); }
  uuid(uuid) { return this.pushArg('-uuid', uuid); }


  /*
   *  C P U S
   *  R A M
   *  G F X
   *  K E Y B O A R D
   *  tested
   */
  // -smp [cpus=]n[,cores=cores][,threads=threads][,sockets=sockets][,maxcpus=maxcpus]
  smp(sockets=1,cores=1,threads=1) { return this.pushArg('-smp', `cpus=${sockets*cores*threads},sockets=${sockets},cores=${cores},threads=${threads}`); }
  // -cpu model
  cpuModel(model='qemu64')          { return this.pushArg('-cpu', model); }
  // -m [size=]megs[,slots=n,maxmem=size]
  ram(ram) { return this.pushArg('-m', `${ram}M`); }
  // -vga type
  vga(vga = 'none') { return this.pushArg('-vga', vga); }
  // -k language
  keyboard(keyboard) { return this.pushArg('-k', keyboard); }


  /*
   *  M A C H I N E  A N D  A C C E L E R A T O R
   *  tested
   */
  // -machine [type=]name[,prop=value[,...]]
  machine(machine='pc') { return this.pushArg('-machine', `type=${machine}`); }
  // accel=accels1[:accels2[:...]]
  accel(accels)         { return this.pushArg('-machine', `accel=${accels}`); }
  // -enable-kvm
  kvm()                 { return this.pushArg('-enable-kvm'); }


  /*
   *  P O R T  R E L A T E D  S T U F F
   *  V N C
   *  Q M P
   *  S P I C E
   *  tested
   */
  // -vnc display[,option[,option[,...]]]
  vnc(port) { return this.pushArg('-vnc', `:${port}`); }
  // -qmp dev
  qmp(port) { return this.pushArg('-qmp-pretty', `tcp:127.0.0.1:${port},server`); }
  // -spice option[,option[,...]]
  spice(port, addr, password) {
    if (password) { return this.pushArg('-spice', `port=${port},addr=${addr},password='${password}'`) }
    else          { return this.pushArg('-spice', `port=${port},addr=${addr},disable-ticketing`)}
  }


  /*
   *  D R I V E S
   *    I M A G E
   *    P A R T I T I O N
   *    N B D
   *    C D R O M
   *  tested
   */
  drive(type, path, intf) {
    switch (type) {
      case 'disk':
        return this.pushArg('-drive', `file=${path},media=disk,if=${intf}`);

      case 'partition':
        return this.pushArg('-drive', `file=${path},media=disk,if=${intf},cache=none`);

      case 'nbd':
        throw "nbd unsupported";

      case 'cdrom':
        return this.pushArg('-drive', `file=${path},media=cdrom,if=${intf}`);
    }
  }


  /*
   *  N E T
   * 
   */
  net(macAddr, card='rtl8139', mode='host', opts) {
    if (mode == 'host' || osType == 'darwin') {
      var ext = 'user';
      if (opts) {
        ext = opts.fwds.reduce( (prev, fwd) => {
          return `${prev},hostfwd=tcp:${fwd.hostIp}:${fwd.hostPort}-${opts.guestIp}:${fwd.guestPort}`;
        }, `${ext},dhcpstart=${opts.guestIp}`);
      } // if
      return this.pushArg('-net', `nic,model=${card},macaddr=${macAddr}`, '-net', ext);
    } else if (mode == 'bridge') {
      return this.pushArg('-net', `nic,model=${card},macaddr=${macAddr}`, '-net', 'tap');
    } // else if

    return this;
  }


  /*
   *  T A B L E T
   *  M O U S E
   *  tested
   */
  tablet() { return this.pushArg('-usbdevice', 'tablet'); }
  mouse()  { return this.pushArg('-usbdevice', 'mouse');  }


  /*  P U S H  A R G S */
  pushArg() {
    this.args.push.apply(this.args, arguments);
    return this;
  } // pushArg()
}

module.exports = Parser;





/*



  constructor: ->
    @args    = [ 'qemu-system-x86_64', '-nographic', '-parallel', 'none', '-serial', 'none']
    @qmpPort = 0
    @macAddr = crypto.randomBytes(6).toString('hex').match(/.{2}/g).join ':'
  





  
  snapshot: () ->
    @pushArg '-snapshot'
    return this
  
  boot: (type, once = true) ->
    args = ''
    if once is true
      args += 'once='
    
    if      type is 'hd'
      args = "#{args}c"
    else if type is 'cd'
      args = "#{args}d"
    else if type is 'net'
      args = "#{args}n"
    
    @pushArg '-boot', args
    return this

  
  # NUMA // numactl --cpunodebind={} --membind={}
  hostNuma: (cpuNode, memNode) ->
    @args.unshift '--'
    @args.unshift "--membind=#{memNode}"
    @args.unshift "--cpunodebind=#{cpuNode}"
    @args.unshift 'numactl'
    return this
  # NUMA

  
  usbOn: (usbVersion = 2) ->
    if      2 is Number usbVersion
      @pushArg '-device', 'usb-ehci,id=usb,bus=pci.0,addr=0x4' # pass usb 2.0
    else if 3 is Number usbVersion
      @pushArg '-device', 'nec-usb-xhci,id=usb,bus=pci.0,addr=0x4' #p pass usb 3.0
    return this

  
  usbDevice: (vendorId, productId) ->
    @pushArg '-device', "usb-host,vendorid=0x#{vendorId},productid=0x#{productId},id=hostdev0,bus=usb.0"
    return this

  
  daemon: ->
    @pushArg '-daemonize'
    return this

  
  balloon: ->
    @pushArg '-balloon', 'virtio'
    return this

    

  


# qemu-system-x86_64 -smp 2 -m 1024 -nographic -qmp tcp:127.0.0.1:15004,server -k de -machine accel=kvm -drive file=/...,media=cdrom -vnc :4 -net nic,model=virtio,macaddr=... -net tap -boot once=d -drive file=/dev/...,cache=none,if=virtio
*/
