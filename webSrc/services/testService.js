/***
 * (c) 2016 by duo.uno
 *
 ***/
 
 // @todo add fastFilter statement maybe into query.query
import app from 'app'

  let angularModule = ['$route', '$routeParams', 'queryService', 'fastFilterService', '$q'];


  angularModule.push((route, params, query, fastFilter, q) => {

    return {
      test:() => {
        let d = q.defer();

        let {from, to, index} = params;
        from            = Number(from);
        to              = Number(to);
        index           = Number(index);
        let offset      = from + index - 1;
        let batchSize   = to - from + 1;
        let prevDocLink = '', nextDocLink = '', docsLink = '';

        let limit = 3;
        if(offset < 0) {
          offset = 0;
          limit  = 2;
        } // if
        query.query(`for doc in ${params.currentCollection} ${fastFilter.currentRule()}\n limit ${offset},${limit} return doc._key`).then(result => {
          result = result.result;
          let newIndex = index + 1;
          if(newIndex > batchSize-1) {
            nextDocLink = `database/${params.currentDatabase}/collection/${params.currentCollection}/${from + batchSize}/${to + batchSize}/0/document/${result.slice(-1)[0]}`;
          } else {
            nextDocLink = `database/${params.currentDatabase}/collection/${params.currentCollection}/${from}/${to}/${index+1}/document/${result.slice(-1)[0]}`;
          }
          newIndex = index-1;
          if(newIndex < 0) {
            prevDocLink = `database/${params.currentDatabase}/collection/${params.currentCollection}/${from - batchSize}/${to - batchSize}/${batchSize-1}/document/${result.slice(0,1)[0]}`;
          } else {
            prevDocLink = `database/${params.currentDatabase}/collection/${params.currentCollection}/${from}/${to}/${index-1}/document/${result.slice(0,1)[0]}`;
          }
          docsLink = `database/${params.currentDatabase}/collection/${params.currentCollection}/${from}/${to}`;
          d.resolve({docsLink, prevDocLink, nextDocLink, _keys:result});
        });
        return d.promise;
      }
    }
  });

  app.service('testService', angularModule);
