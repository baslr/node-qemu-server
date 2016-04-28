/***
 * (c) 2016 by duo.uno
 *
 ***/

import app from 'app'


let angularModule = ['$scope', 'queryService'];

angularModule.push((scope, query) => {

  var canvas = document.getElementById('myCanvas');

  var canvasWidth  = canvas.width  = document.body.clientWidth;
  var canvasHeight = canvas.height = document.body.clientHeight;

  var ctx = window.ctx = canvas.getContext('2d');


  var graph = [];
  let mX    = 600;
  let mY    = 600;


  canvas.onmousedown = (e) => {
    console.log(e.layerX, e.layerY);


    for(let g of graph) {
      let box = g.box;
      let x = e.layerX;
      let y = e.layerY;

      console.log(box);

      if(box.left <= x && x <= box.right && box.top <= y && y <= box.bottom ) {
        console.log(`clicked in graph ${g.result[0].vertices[0].title}`);
        g.expanded = !g.expanded;

        requestAnimationFrame(draw);
        break;
      }
    }

  } // keydown()

  let draw = () => {
    ctx.globalAlpha = 0.0;
    ctx.clearRect(0,0, canvasWidth, canvasHeight);

    ctx.globalAlpha = 1.0;

    ctx.fillStyle = 'rgba(255,0,0,1)'

    ctx.fillRect(0,0,50,50);

    ctx.fillStyle = 'rgba(0,255,0,1)'

    ctx.fillRect(50,50,100,100);


    
    
    let img = ctx.getImageData(25, 25, 50, 50);

    console.log(img);


    var overlayCanvas = document.createElement("canvas");
    overlayCanvas.width = overlayCanvas.height = 50;
    overlayCanvas.style.imageRendering = '-webkit-crisp-edges';
    overlayCanvas.getContext("2d").putImageData(img, 0, 0);
    ctx.drawImage(overlayCanvas, 50, 50);


    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    //ctx.clearRect(0, 0, canvasWidth, canvasHeight);


    ctx.fillStyle = 'rgba(0, 0, 0, 1)';

    for(let result of graph) {
      ctx.font = '13px helvetica';

      console.log(result.expanded);

      result.box = {top:mY - 16, bottom:mY + 16, left:mX, right:mX}

      ctx.fillText(result.result[0].vertices[0].title, mX, mY);
      let m1 = Math.ceil(ctx.measureText(result.result[0].vertices[0].title).width );

      ctx.fillText(`Vertices: ${result.result.length}`, mX, mY+12);
      let m2 = Math.ceil(ctx.measureText(`Vertices: ${result.result.length}`).width );

      if(m1 > m2) {
        result.box.right += m1;
      } else { // if
        result.box.right += m2;
      } // else
      
      // 

      let rotpart = (2 *Math.PI) / result.result.length;      




      if(result.expanded) {
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




        let i = 0;
        let slots = 5;
        while(result.result[i]) {
          ctx.fillColor = "rgba(0, 0, 0, 1)" 

          ctx.clearRect(50, 50-13, 100, 13);


          let title = result.result[i].vertices[1].title;
          ctx.fillText(title, 50, 50);
          let img = ctx.getImageData(50, 50-13, 100, 13);

          overlayCanvas.getContext('2d').putImageData(img, 0, 0);;

          ctx.drawImage(overlayCanvas, result.box.right + 5 + 105*(i % slots),  result.box.top + 13 + Math.floor(i/slots) * 13 -100);

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
  }


  query.query(`for v, e, p in 1..1 outbound 'wikigraph/8793461167787' articleRefsTo return p`).then( (result) => {
    scope.result = result;

    graph.push({result:result.result, expanded:false});


    requestAnimationFrame(draw);
  });



});

app.controller('graphController', angularModule);
