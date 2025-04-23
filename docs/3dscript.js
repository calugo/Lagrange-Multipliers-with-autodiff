
import * as THREE from 'three';
import Stats from 'stats-gl';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


let camera, scene, renderer;
let gui;
let stats;
let A, B, plot_case='plane';
let tf;
let plane, planeGeometry,prt;
let planepos,xp,yp,zp;
let dotGeometry,DotGeo,pt;
let status = false;
let statusmsg; 
let Rt,n;
let play_button;
let playflag = false;
const playtime = 'Play t: ';


let dotSolMat = new THREE.PointsMaterial(
          {opacity:0.75, size: 0.025, color: 0xc1f211, transparent: true});

let dotMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0xff0000 });

init()

const pyodideRuntime = await loadPyodide();
await pyodideRuntime.loadPackage("micropip");
const micropip = pyodideRuntime.pyimport("micropip");
await micropip.install("autograd")
pyodideRuntime.runPython(await (await fetch("integrals.py")).text());

let pyparaboloid = pyodideRuntime.globals.get('paraboloid');
let pyplane = pyodideRuntime.globals.get('plane');
let pywave = pyodideRuntime.globals.get('wave');
let RK = pyodideRuntime.globals.get('RK');

statusmsg = document.getElementById('info');
statusmsg.innerText='Ready \n Plane:Ax+By, Paraboloid: Ax^2+By^2, Wave:0.2*(x^2+y^2)*cos(Ax^2+By^2) ';

//init();

function init(){

        A = 0.0;
        B = 0.0;
        xp = 0.4;
        yp = -0.2;
        zp = 0.0;
        tf = 1.0;

				scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x222222 );
				//scene.background = new THREE.Color( 0xf0f0f0 );
				camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10000 );

				camera.position.set( 0, 2, 2 );
				scene.add( camera );

				scene.add( new THREE.AmbientLight( 0xf0f0f0, 3 ) );
				const light = new THREE.SpotLight( 0xffffff, 4.5 );
				light.position.set( 0, 1500, 200 );
				light.angle = Math.PI * 0.2;
				light.decay = 0;
				light.castShadow = true;
				light.shadow.camera.near = 200;
				light.shadow.camera.far = 2000;
				light.shadow.bias = - 0.000222;
				light.shadow.mapSize.width = 1024;
				light.shadow.mapSize.height = 1024;
				scene.add( light );

				planeGeometry = new THREE.PlaneGeometry( 3, 3 , 40, 40);
				planeGeometry.rotateX( - Math.PI / 2 );
				const planeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ffff, opacity: 0.2, side: THREE.DoubleSide, wireframe: true, transparent: true } );
        plane = new THREE.Mesh( planeGeometry, planeMaterial );
        planepos = planeGeometry.getAttribute('position');
				plane.receiveShadow = true;
				scene.add( plane );


        dotGeometry = new THREE.BufferGeometry();
        dotGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0]), 3));
        
        prt = new THREE.Points(dotGeometry, dotMaterial);
        prt.position.x = xp;
        prt.position.z = yp;
        prt.position.y = zp;
        scene.add(prt);

        const axesHelper = new THREE.AxesHelper( 2 );
        scene.add( axesHelper );

	      renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.shadowMap.enabled = true;
        document.body.appendChild( renderer.domElement );

        // Controls
				const controls = new OrbitControls( camera, renderer.domElement );
				controls.damping = 0.2;
				controls.addEventListener( 'change', render );

        window.addEventListener( 'resize', onWindowResize );
        onWindowResize();

        initGui();
        render();
        
}

function rem_solution(){
  let kn = 0;
  while(kn<Rt.length){
    let pn = scene.getObjectByName(kn);
    scene.remove(pn);
    kn++;
  }
  render();
  playflag = false;
}

function add_solution(jn, rn){
        DotGeo = new THREE.BufferGeometry();
        DotGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0]), 3));
        pt = new THREE.Points(dotGeometry, dotSolMat);
        pt.position.x = rn[1];
        pt.position.z = rn[2];
        pt.position.y = rn[3];
        pt.name = jn;
        scene.add(pt);
}

function render() {

  renderer.render(scene, camera);
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();

}


function initGui(){

  gui =  new GUI();

  const param = {
    'xo':xp,
    'yo':yp,
    'A':A,
    'B':B,
    'Case': 0,
    'Time': tf,
    'Run': Runpy,
    'Plot': Play
  };


  gui.add( param, 'Case', { 'plane': 0, 'paraboloid': 1, 'wave': 2 } ).onChange( function ( val ) {

		switch ( val ) {
				case 0:
					//console.log('plane');
          plot_case = 'plane';
          if(playflag){rem_solution();}
          transformplane(plot_case);
					break;

				case 1:
					//console.log('paraboloid')
          plot_case = 'paraboloid';
          if(playflag){rem_solution();}
          transformplane(plot_case);
					break;

        case 2:
          plot_case = 'wave';
          if(playflag){rem_solution();}
          transformplane(plot_case);
          break;
        }
				});

  gui.add( param, 'xo', -1.5, 1.5, 0.01 ).onChange( function ( val ) {
    //console.log('A');
    if(playflag){rem_solution();}
      prt.position.x = val;
      xp = prt.position.x;
      yp = prt.position.z;

      transformplane(plot_case);
    } );

  gui.add( param, 'yo', -1.5, 1.5, 0.01 ).onChange( function ( val ) {
    //console.log('A');
    if(playflag){rem_solution();}
      prt.position.z= val;
      xp = prt.position.x;
      yp = prt.position.z;

      transformplane(plot_case);
    } );



  gui.add( param, 'A', 0.0, 5, 0.01 ).onChange( function ( val ) {
    //console.log('A');
    if(playflag){rem_solution();}
    A = val;
    transformplane(plot_case);
    } );
  
  gui.add( param, 'B', 0.0, 5.0, 0.01 ).onChange( function ( val ) {
    //console.log('B');
    if(playflag){rem_solution();}
    B = val;
    transformplane(plot_case);
    } );
  

    gui.add( param, 'Time', 0.5, 50.0, 0.5 ).onChange( function ( val ) {
    //console.log('A');
     tf = val;
    } );

  gui.add(param,'Run');


  play_button = gui.add(param,'Plot').disable();

}

function setIntTitle(title){
  statusmsg.innerText = title;
}


function Runpy(){


  if(playflag){rem_solution();}

  xp = prt.position.x;
  yp = prt.position.z;
  zp = prt.position.y;
  Rt = RK(tf,[xp,yp,zp],plot_case,1e-2,A,B);
  play_button.disable(false);
  console.log(Rt);

}

function Play(){

  if (playflag == false){
    let jn =0;
    while(jn<Rt.length){
      add_solution(jn,Rt[jn])
      jn++;
    }
    render();
    playflag = true;
    play_button.disable();

  }

}

function transformplane(shape){
  
  const planepos = planeGeometry.getAttribute('position');
  const vertex = new THREE.Vector3();
  let  n ;

  if (shape == 'paraboloid'){
    n=2;
    
    prt.position.y = pyparaboloid(A,B,xp,yp);
  }

  if (shape == 'plane'){
    n=1;
    prt.position.y = pyplane(A,B,xp,yp);
  }

  if (shape == 'wave'){
    n=2;
    prt.position.y = pywave(A,B,xp,yp);
  }

  for (let i= 0; i < planepos.count;i++){
      vertex.fromBufferAttribute( planepos, i ); // read vertex
      if ((shape == 'paraboloid') || (shape == 'plane')) { 
        vertex.y = A*vertex.x**n+B*vertex.z**n;//+B*vertex.y;
      }
      if (shape == 'wave'){
        vertex.y = 0.2*(vertex.x**n+vertex.z**n)*Math.cos(A*vertex.x**n + B*vertex.z**n);
      }
      planepos.setXYZ( i, vertex.x, vertex.y, vertex.z ); // 
      }
  //prt.position.needsUpdate = true;
  planepos.needsUpdate = true;
  render();
}
