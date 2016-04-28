/***
 * (c) 2016 by duo.uno
 *
 ***/

import app from 'app'


let angularModule = ['$scope', '$http', '$routeParams', '$timeout', 'messageBrokerService', '$interpolate', 'queriesService'];

angularModule.push((scope, http, params, timeout, messageBroker, interpolate, queries) => {

  http.put(`/_db/${params.currentDatabase}/_api/query/properties`, {slowQueryThreshold:0, enabled:true, trackSlowQueries:true});


  console.log('init aqlController');

  let collections    = [];
  let curTimeout     = undefined;
  scope.queryResults = [];
  scope.lastError    = '';

  scope.selectedQuery = queries.currentName();
  scope.savedQueries  = queries.queries;
  scope.options       = scope.savedQueries[scope.selectedQuery].options;
  $('TEXTAREA#aqlEditor').val(scope.savedQueries[scope.selectedQuery].query);


  http.get(`/_db/${params.currentDatabase}/_api/collection`).then(data => collections = data.data.collections.map((col) => col.name) );
  let words = ['LET', 'IN', 'RETURN', 'TO_NUMBER', 'TO_STRING', 'IS_NULL', 'NOT_NULL', 'FILTER', 'FOR'];

  $('TEXTAREA#aqlEditor').on('keydown', (ev) => {
    if(ev.keyCode != 13) return;

    return

    // check if we can expand txt

    let txt  = $('TEXTAREA#aqlEditor').val();
    let sPos = $('TEXTAREA#aqlEditor').prop('selectionStart');
    let ePos = $('TEXTAREA#aqlEditor').prop('selectionEnd');

    if (sPos == ePos) return

    let partText = txt.slice(sPos, ePos);
    if(~partText.search(/\s/)) return;

    let i = sPos-1;
    while(txt[i]) {
      if(0 == txt[i].search(/\s/)) break;
      partText = txt[i] + partText;
      i--;
    }
    let ssPos = sPos - (sPos - i) + 1;

    i = ePos;
    while(txt[i]) {
      if(0 == txt[i].search(/\s/)) break;
      partText = partText + txt[i];
      i++;
    }

    console.log('PARTTEXT', [partText]);

    if(~words.indexOf(partText.toUpperCase())) {
      $('TEXTAREA#aqlEditor').val( txt.slice(0, ssPos) + partText.toUpperCase() + txt.slice(ePos) );
      $('TEXTAREA#aqlEditor').prop('selectionStart', ePos);
      $('TEXTAREA#aqlEditor').prop('selectionEnd', ePos);
    }





    // check if word expansion


    // how to?
     // from selection to right unit \n xor space 


    console.log(ev);
    // ev.stopPropagation();
    // ev.stopImmediatePropagation();
    ev.preventDefault();
  });

  $('TEXTAREA#aqlEditor').on('blur', (ev) => {
    if (scope.options.eval != 'blur') return;
    sendAqlQuery($('TEXTAREA#aqlEditor').val()); });


  $('TEXTAREA#aqlEditor').on('keyup', (ev) => scope.$apply( () => {
    let txt       = $('TEXTAREA#aqlEditor').val();
    let txtArr    = txt.split('\n');
    let pos       = $('TEXTAREA#aqlEditor').prop('selectionStart');
    let ePos      = $('TEXTAREA#aqlEditor').prop('selectionEnd');

    // fooo


    scope.evalOptions(txtArr[0]);

    if (scope.options.eval === 'asap') {
      sendAqlQuery(txt);
    } else if( ! isNaN(scope.options.eval)) {
      timeout.cancel(curTimeout);

      curTimeout = timeout( () => {sendAqlQuery(txt); }, scope.options.eval);
    } // if

    return



    if(~[8, 37, 38, 39, 40].indexOf(ev.keyCode)) return;
    console.log('-------------------------------', ev);


    console.log('after end is:', [txt[ePos]]);
    if(txt[ePos] && !~txt[ePos].search(/\s/)) return;

    let before = txt.slice(0,pos), 
        after = txt.slice(pos);
    let beforeArray = before.split(' ');
    let afterArray  = after.split(' ');

    console.log('beforeArray afterArray');
    console.log(beforeArray);
    console.log(afterArray);

    let beforeFirst = beforeArray.slice(-1).pop();
    let afterFirst  = afterArray.slice(0,1).pop();

    let i = pos-1, partText = txt.slice(pos, ePos);;
    while(txt[i]) {
      if(0 == txt[i].search(/\s/)) break;
      partText = txt[i] + partText;
      i--;
    }

    i = ePos;
    while(txt[i]) {
      if(0 == txt[i].search(/\s/)) break;
      partText = partText + txt[i];
      i++;
    }

    let cursorWord = partText;

    console.log('cursorWord is', [cursorWord]);

    console.log('beforeFirst afterFirst', [beforeFirst, afterFirst]);

    if(beforeFirst.length) {
      // check first if cursor word matches
      let noMatch = true;
      for(let word of words) {
        if(word.toLowerCase() != cursorWord.toLowerCase()) continue
        noMatch = false;
        break;
      } // for

      if(noMatch) {
        for(let word of words) {
                // if (word.toLowerCase() == beforeFirst.toLowerCase()) continue;
                if(0 == word.toLowerCase().indexOf(beforeFirst.toLowerCase())) {
                  console.log('word match', word);

                  console.log('would insert', word.slice(beforeFirst.length));


                  let newStr = before + word.slice(beforeFirst.length) + after;
                  console.log('newstr', newStr);

                  $('TEXTAREA#aqlEditor').val(newStr);

                  $('TEXTAREA#aqlEditor').prop('selectionStart', pos);
                  $('TEXTAREA#aqlEditor').prop('selectionEnd', pos+ word.slice(beforeFirst.length).length );


                  break;
                }
              } // for   
      }
      
    } // if


    console.log(beforeFirst, before, after);
  }));


  let sendAqlQuery = (txt) => {
    let lines   = txt.split('\n');
    let queries = [];
    let idx     = undefined;

    for(let line of lines) {
      if(0 == line.trim().toLowerCase().search(/^\/\/\ *query$/) )
        if(idx == undefined) queries[idx = 0] = '';
          else queries[++idx] = '';
      if(idx == undefined) continue;
      queries[idx] += line + '\n';
    }

    scope.queryResults.length = idx = 0;

    let _buildResult = (qData, httpTime, qSlow) => {
      scope.lastError = '';
      let result        = scope.queryResults[idx] = {};
      result.httpTime   = httpTime;
      result.execTime   = qSlow ? qSlow.runTime * 1000 : 'No timing available';
      Object.assign(result, qData.data);
      result.resultJson = JSON.stringify(qData.data.result, false, 2);
      if (scope.options.table) {
        result.keys = [];
        for(let doc of result.result) {
          for(let key of Object.keys(doc)) {
            if (~result.keys.indexOf(key)) continue;
            result.keys.push(key);
          };
        } // for
      } // if
      _send(++idx);
    }

    let _send = () => {
      if (!queries[idx]) return;

      let start = performance.now();
      http.post(`/_db/${params.currentDatabase}/_api/cursor?qid=${start}`, {
        batchSize: scope.options.max, query:`// qid:${start}\n` + queries[idx]
      }).then( qData => {
        let end = performance.now();

        http.get(`/_db/${params.currentDatabase}/_api/query/slow`).then(data => {
          for (var i = data.data.length - 1; i >= 0; i--) {
            let slowq = data.data[i];
            if (0 != slowq.query.indexOf(`// qid:${start}\n`) ) continue;
            _buildResult(qData, end-start, slowq);
            break;
          } // for
        }, () => _buildResult(qData, end-start));
      }, (data) => scope.lastError   = data.data.errorMessage);
    }
    _send(0);

  }

  scope.evalOptions = (optionLine) => {
    let sPos = $('TEXTAREA#aqlEditor').prop('selectionStart');
    let len  = optionLine.length;

    // check for name
    if(len < sPos) {
      let result = optionLine.match(/name:(\S+)/);
      let name   = result[1] || 'unsaved'
      scope.options['name']    = name;
      scope.selectedQuery      = name;
      scope.savedQueries[name] = {name:name, query:$('TEXTAREA#aqlEditor').val()};
    } // if

    optionLine = optionLine.trim().toLowerCase();
    if (!~optionLine.search(/^\/\//)) return; // cancel if its not a starting comment line

    let options = [{name:'eval',  q:/eval\:(asap|blur|\d+ms)/, f:(m) => 0 === m.search(/^\d+ms$/) ? Number(m.slice(0, -2)) : m },
                   {name:'max',   q:/max\:(all|\d+)/, f:(m)          => isNaN(m) ? m : Number(m) },
                   {name:'table', q:/table:(true|false)/, f:(m)      => JSON.parse(m) }];
    let opts = {};
    for(let key in options) {
      let option = options[key];
      let result = optionLine.match(option.q);
      if (null == result) continue;
      opts[option.name] = option.f ? option.f(result[1]) : result[1];
    } // for
    scope.options = scope.savedQueries[scope.selectedQuery].options = opts;
    queries.save();
  } // evalOptions()

  scope.changedQuery = () => {
    scope.queryResults.length = 0;
    let queryName = scope.selectedQuery;
    $('TEXTAREA#aqlEditor').val(scope.savedQueries[queryName].query);
    scope.evalOptions(scope.savedQueries[queryName].query.split('\n')[0]);

    if(scope.options.eval == 'asap') {
      sendAqlQuery(scope.savedQueries[queryName].query);
    }
  }

  scope.copyToClipboard = (result) => {
    let keys = result.keys;
    let lines = [keys.join('\t')];

    for(let doc of result.result) {
      let line = [];
      for(let key of keys) {
        line.push(interpolate('{{doc[key]}}')({doc:doc, key:key}));
      } // for
      lines.push(line.join('\t'));
    } // for

    document.oncopy = (e) => {
      e.clipboardData.setData('text/plain', lines.join('\n'));
      e.preventDefault();
      document.oncopy = null;
    } // oncopy()
    document.execCommand('copy');
  }

  scope.$on('$destroy', () => $('TEXTAREA#aqlEditor').off('keyup', 'keydown', 'blur') );
});

app.controller('aqlController', angularModule);
