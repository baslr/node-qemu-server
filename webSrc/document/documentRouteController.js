/***
 * (c) 2016 by duo.uno
 *
 ***/
 
import app from 'app'

let angularModule = ['$scope', '$routeParams', '$http', '$location', 'queryService', '$route'];

angularModule.push((scope, params, http, location, query, route) => {

  console.log('init documentRouteController');
  let from      = Number(params.from);
  let index     = Number(params.index);

  query.query(`for doc in ${params.collectionName} limit ${from + index},1 return doc._key`).then(result => {
    console.log( location.path() );
    location.path(`${location.path()}/document/${result[0]}`);
  });



  // location.path('/');

});

app.controller('documentRouteController', angularModule);



// FOR x IN @@collection LET att = SLICE(ATTRIBUTES(x), 0, 25) SORT TO_NUMBER(x._key) == 0 ? x._key : TO_NUMBER(x._key) LIMIT @offset, @count RETURN KEEP(x, att)"
