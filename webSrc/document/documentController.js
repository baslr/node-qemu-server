/***
 * (c) 2016 by duo.uno
 *
 ***/

import app from 'app'

import jq from 'jquery'


let angularModule = ['$scope', '$routeParams', '$http', 'testService']

angularModule.push((scope, params, http, testService) => {
  console.log('init documentController');
  scope.params = params;

  let from     = scope.from  = Number(params.from);
  let to       = Number(params.to);
  let index    = scope.index = Number(params.index);
  scope._doc   = {};

  testService.test().then(results => ({docsLink: scope.docsLink, prevDocLink: scope.prevDocLink, nextDocLink: scope.nextDocLink, _keys: scope._keys} = results));

  scope.obj = {data: {}, preferText:true, options: { mode: 'tree',
    change:(err) => {
      if(err) {
        scope.obj.canSave = false;
      } else { // if
        scope.obj.canSave = true;
      } // else
    },
    onEditable:(node) => {
      if(-1 < ['_key', '_id', '_rev'].indexOf(node.field) && node.path.length == 1)
        return false;
      return true;
    }},
    canSave:true
  };

  http.get(`/_db/${params.currentDatabase}/_api/document/${params.currentCollection}/${params.documentKey}`).then(data => {
    scope.obj.data = data.data;
    for(let type of ['_id', '_rev', '_key', '_from', '_to']) {
      if(data.data[type] === undefined) continue;
      scope._doc[type] = data.data[type];
      delete data.data[type];
    } // for
    resize();
  });

  scope.saveDoc = () => {
    console.log(scope.obj.data);
    console.log(Object.assign({}, scope.obj.data, scope._doc));
    http.put(`/_db/${params.currentDatabase}/_api/document/${params.currentCollection}/${params.documentKey}`, scope.obj.data).then( data => {
      console.log(data);
    });
    
  };

  // todo: fix uglyness maybe in css?
  let resize = () => $('DIV#ngeditor').css('height', `${window.document.documentElement.clientHeight - $('div#ngeditor').position().top}px`);
  $(window).on('resize', resize);
  scope.$on('$destroy', () => {
    console.log('destroy');
    $(window).off('resize', resize);
  });
});

app.controller('documentController', angularModule);



// FOR x IN @@collection LET att = SLICE(ATTRIBUTES(x), 0, 25) SORT TO_NUMBER(x._key) == 0 ? x._key : TO_NUMBER(x._key) LIMIT @offset, @count RETURN KEEP(x, att)"
