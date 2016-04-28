/***
 * (c) 2016 by duo.uno
 *
 ***/
 
import app from 'app'


let angularModule = ['$scope', '$routeParams', '$http', 'messageBrokerService', 'queryService', 'formatService', 'fastFilterService'];

angularModule.push((scope, params, http, messageBroker, query, format, fastFilterService) => {
  scope.format = format;
  scope.params = params;

  let from = scope.from = Number(params.from);
  let to   = scope.to   = Number(params.to);
  scope.batchSize = to - from + 1;
  scope.docs = [];

  scope.rules = fastFilterService.rules;

  scope.fastFilter = {editableRule:scope.rules[messageBroker.last('current.fastFilter')].rule, selectedRule:messageBroker.last('current.fastFilter'), active:messageBroker.last('show.fastFilter')};
  scope.fastFilterRuleChanged = () => {
    scope.fastFilter.editableRule = scope.rules[scope.fastFilter.selectedRule].rule;
    messageBroker.pub('current.fastFilter', scope.fastFilter.selectedRule);
    scope.queryDocs();
  }

  scope.toggleFastFilterTexterea = () => {
    scope.fastFilter.active = !scope.fastFilter.active;
    messageBroker.pub('show.fastFilter', scope.fastFilter.active);
  }

  scope.applyFastFilter = (fromBlur = false) => {
    let lines    = scope.fastFilter.editableRule.split('\n');
    let ruleName = undefined;
    let pos      = $('textarea#filterRuleText').prop('selectionStart');
    let plusPos  = 0;

    // first line does not match a rule name
    if (fromBlur) {
      if(!~lines[0].search(/^\/\/\ *\S+/)) {
        ruleName = 'last unsaved';
        lines.unshift(`// ${ruleName}`);
      } else {
        ruleName = lines[0].match(/^\/\/\ +(.+)$/)[1].trim();
      }
    } else if(1 < lines.length) { // check position only when min 2 lines available
      if (~scope.fastFilter.editableRule.slice(0, pos).search('\n')) {
        try {
          ruleName = lines[0].match(/^\/\/\ *(.+)$/)[1].trim();
          if ('' == ruleName) {
            ruleName = 'last unsaved';
            lines[0] = ('// last unsaved');
            plusPos = 12;
          }
        } catch(e) {
          ruleName = 'last unsaved';
          lines.unshift('// last unsaved');
          plusPos = 16;
        } // catch
      }// if
    } // else if

    if ('none' === ruleName) {
      lines[0] = '// last unsaved'
      ruleName = 'last unsaved';
      plusPos = 8;
    } // if

    setTimeout(() => {
      $('textarea#filterRuleText').prop('selectionStart', pos + plusPos);// 'last unsaved'.length + 1);
      $('textarea#filterRuleText').prop('selectionEnd',   pos + plusPos);// 'last unsaved'.length + 1);
    }, 100);

    scope.fastFilter.editableRule = lines.join('\n');

    if(ruleName) {
      scope.rules[ruleName] = {name:ruleName, rule:scope.fastFilter.editableRule};
      scope.fastFilter.selectedRule = ruleName;
      messageBroker.pub('current.fastFilter', ruleName);
      fastFilterService.save();
    }

    scope.queryDocs();
  }

  http.get(`/_db/${params.currentDatabase}/_api/collection/${params.currentCollection}/count`).then(data => {
    scope.collectionInfo = data.data;
    messageBroker.pub('collections.reload');
    scope.queryDocs();
  });

  // call pagination
  scope.queryDocs = () => {
    query.query(`for doc in ${params.currentCollection} let attr = slice(attributes(doc), 0, 20) ${scope.fastFilter.editableRule} \nlimit ${params.from},${scope.batchSize} return keep(doc, attr)`).then( (result) => {
      scope.collectionInfo.count = result.extra.stats.fullCount;
      let pages = Math.ceil(result.extra.stats.fullCount/scope.batchSize);

      let curpage = from / scope.batchSize + 1;

      let left = curpage - 1;
      let right = pages - curpage;

      let arr = [];
      arr.push(curpage);

      for(let i = 1; i <= 3; i++) {
        if(left-i >= 0) {
          arr.unshift(curpage-i);
        }
        if(right-i >= 0) {
          arr.push(curpage+i);
        }
      } // for

      let attrLength = Math.floor(arr.length/2);

      for(let i = 2; i<right - attrLength && i < 20; i++) {
        let n = curpage +  Math.round(Math.pow(Math.E, i));
        if(n >= pages) break;
        arr.push(n);
      }

      for(let i = 2; i<left - attrLength && i < 20; i++) {
        let n = curpage -  Math.round(Math.pow(Math.E, i));
        if(n < 2) break;
        arr.unshift(n);
      }

      if(attrLength < right && -1 == arr.indexOf(pages)) arr.push(pages);
      if(attrLength < left  && -1 == arr.indexOf(1))     arr.unshift(1);

      scope.pages = arr;


      scope.docs = result.result;
      for(let doc of scope.docs) {
        delete doc._rev;
        delete doc._id;
      }
    });
  }
});

app.controller('collectionController', angularModule);



// FOR x IN @@collection LET att = SLICE(ATTRIBUTES(x), 0, 25) SORT TO_NUMBER(x._key) == 0 ? x._key : TO_NUMBER(x._key) LIMIT @offset, @count RETURN KEEP(x, att)"
