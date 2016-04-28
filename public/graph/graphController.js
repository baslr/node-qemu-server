define(['app'], function (_app) {
  'use strict';

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var angularModule = ['$scope', 'queryService']; /***
                                                   * (c) 2016 by duo.uno
                                                   *
                                                   ***/

  angularModule.push(function (scope, query) {

    var canvas = document.getElementById('myCanvas');

    var canvasWidth = canvas.width = document.body.clientWidth;
    var canvasHeight = canvas.height = document.body.clientHeight;

    var ctx = window.ctx = canvas.getContext('2d');

    var graph = [];
    var mX = 600;
    var mY = 600;

    canvas.onmousedown = function (e) {
      console.log(e.layerX, e.layerY);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = graph[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var g = _step.value;

          var box = g.box;
          var x = e.layerX;
          var y = e.layerY;

          console.log(box);

          if (box.left <= x && x <= box.right && box.top <= y && y <= box.bottom) {
            console.log('clicked in graph ' + g.result[0].vertices[0].title);
            g.expanded = !g.expanded;

            requestAnimationFrame(draw);
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }; // keydown()

    var draw = function draw() {
      ctx.globalAlpha = 0.0;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.globalAlpha = 1.0;

      ctx.fillStyle = 'rgba(255,0,0,1)';

      ctx.fillRect(0, 0, 50, 50);

      ctx.fillStyle = 'rgba(0,255,0,1)';

      ctx.fillRect(50, 50, 100, 100);

      var img = ctx.getImageData(25, 25, 50, 50);

      console.log(img);

      var overlayCanvas = document.createElement("canvas");
      overlayCanvas.width = overlayCanvas.height = 50;
      overlayCanvas.style.imageRendering = '-webkit-crisp-edges';
      overlayCanvas.getContext("2d").putImageData(img, 0, 0);
      ctx.drawImage(overlayCanvas, 50, 50);

      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      //ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = 'rgba(0, 0, 0, 1)';

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = graph[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var result = _step2.value;

          ctx.font = '13px helvetica';

          console.log(result.expanded);

          result.box = { top: mY - 16, bottom: mY + 16, left: mX, right: mX };

          ctx.fillText(result.result[0].vertices[0].title, mX, mY);
          var m1 = Math.ceil(ctx.measureText(result.result[0].vertices[0].title).width);

          ctx.fillText('Vertices: ' + result.result.length, mX, mY + 12);
          var m2 = Math.ceil(ctx.measureText('Vertices: ' + result.result.length).width);

          if (m1 > m2) {
            result.box.right += m1;
          } else {
            // if
            result.box.right += m2;
          } // else

          //

          var rotpart = 2 * Math.PI / result.result.length;

          if (result.expanded) {
            // render childs

            var overlayCanvas = document.createElement("canvas");
            overlayCanvas.width = 100;
            overlayCanvas.height = 13;

            // for(let idx in result.result) {
            //   let title = result.result[idx].vertices[1].title;

            //   ctx.clearRect(50, 50-13, 100, 13);
            //   ctx.fillText(title, 50, 50);

            //   let img = ctx.getImageData(50, 50-13, 100, 13);

            //   overlayCanvas.getContext('2d').putImageData(img, 0, 0);;

            //   // ctx.drawImage(overlayCanvas, 50, 50);

            //   // ctx.fillText(title, mX + Math.sin(rotpart * idx) * 300  , mY + Math.cos(rotpart * idx) * 300);

            //   // ctx.globalAlpha = 0.0;

            //   ctx.translate(600, 600);
            //   ctx.rotate(rotpart*idx);
            //   ctx.drawImage(overlayCanvas, 350, 0); // Math.round(mX + Math.sin(rotpart * idx) * 300), Math.round(mY + Math.cos(rotpart * idx) * 300) );

            //   ctx.setTransform(1, 0, 0, 1, 0, 0);
            //   // ctx.globalAlpha = 1.0;
            //   // break;

            // } // for

            var i = 0;
            var slots = 5;
            while (result.result[i]) {
              ctx.fillColor = "rgba(0, 0, 0, 1)";

              ctx.clearRect(50, 50 - 13, 100, 13);

              var title = result.result[i].vertices[1].title;
              ctx.fillText(title, 50, 50);
              var _img = ctx.getImageData(50, 50 - 13, 100, 13);

              overlayCanvas.getContext('2d').putImageData(_img, 0, 0);;

              ctx.drawImage(overlayCanvas, result.box.right + 5 + 105 * (i % slots), result.box.top + 13 + Math.floor(i / slots) * 13 - 100);

              i++;

              //   // ctx.fillText(title, mX + Math.sin(rotpart * idx) * 300  , mY + Math.cos(rotpart * idx) * 300);

              //   // ctx.globalAlpha = 0.0;
            }
          } // if expanded
        }

        // for(let vertex of result.result) {

        //   ctx.strokeStyle = `rgb(0, 0, 0)`;

        //   //  ctx.beginPath();
        //   //  ctx.ellipse(vertex.x*scale + mX, vertex.y*scale + mY, 50, 50,0,0,2*Math.PI);

        //   //  console.log(vertex.x, vertex.y, '|', vertex.x * scale + mX, vertex.y*scale + mY);

        //   //  ctx.stroke();

        //   ctx.fillText(vertex.vertices[1].title, 300, 0);

        //   ctx.rotate(rotpart);
        // } // for
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    };

    query.query('for v, e, p in 1..1 outbound \'wikigraph/8793461167787\' articleRefsTo return p').then(function (result) {
      scope.result = result;

      graph.push({ result: result.result, expanded: false });

      requestAnimationFrame(draw);
    });
  });

  _app2.default.controller('graphController', angularModule);
});