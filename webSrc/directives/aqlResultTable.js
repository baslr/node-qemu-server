/***
 * (c) 2016 by duo.uno
 *
 ***/

import app from 'app'


let angularDirective = ['$interpolate', '$sce'];

angularDirective.push((interpolate, sce) => {
  return {
    restrict: 'E',
    scope: {
      data: "="
    },
    link: (scope, element) => {

      window.requestAnimationFrame( () => {
        let table = document.createElement('table');
        table.className = 'table table-sm';

        let thead = document.createElement('thead');
        let tr    = document.createElement('tr');
        for(let key of scope.data.keys) {
          let th = document.createElement('th');
          th.textContent = key;
          tr.appendChild(th);
        }
        thead.appendChild(tr);
        table.appendChild(thead);

        let tbody = document.createElement('tbody');

        for(let doc of scope.data.result) {
          let tr = document.createElement('tr');
          for(let key of scope.data.keys) {
            let td = document.createElement('td');
            td.textContent = interpolate('{{doc[key]}}')({doc:doc, key:key});
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        element.get(0).appendChild(table);
      });
    }
  }
});

app.directive('aqlResultTable', angularDirective);
