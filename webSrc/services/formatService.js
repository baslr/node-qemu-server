/***
 * (c) 2016 by duo.uno
 *
 ***/
 
import app from 'app'

  let angularModule = [];


  angularModule.push(() => {
    return (str, fix=0, ext=undefined) => {
      str = Number(str);
      if(ext) ext = ext.toLowerCase();

      if(str > 1000*1000*1000) {
        str = (str / 1000 / 1000 / 1000).toFixed(fix);
        switch(ext) {
          case 'it':
            ext = ' GB';
            break;
          case 'math':
            ext = ' G';
            break;
        } // switch
      } else if(str > 1000*1000) {
        str = (str / 1000 / 1000).toFixed(fix);
        switch(ext) {
          case 'it':
            ext = ' MB';
            break;
          case 'math':
            ext = ' M';
            break;
        } // switch
      } else if(str > 1000) {
        str = (str / 1000).toFixed(fix);
        switch(ext) {
          case 'it':
            ext = ' KB';
            break;
          case 'math':
            ext = ' K';
            break;
        } // switch
      } else {
        str = str.toFixed(fix);
        switch(ext) {
          case 'it':
            ext = ' B';
            break;
          case 'math':
            ext = '';
            break;
        } // switch
      }
      if(ext) str=`${str}${ext}`;
      return str;
    }
  });

  app.service('formatService', angularModule);
