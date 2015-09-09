// global variables
var renderer;
var camera, scene;
var cameraOrtho, sceneRenderTarget;
var control;
var renderStats, physicsStats;
var cameraControl;
var effect;
var manager;
var clock;

var updateNoise = true;

var uniformsNoise, uniformsNormal,
        heightMap, normalMap,
        quadTarget;

//this is absolutely terrible, is there a better way to do this?
Physijs.scripts.worker = 'js/deps/physijs_worker.js';
Physijs.scripts.ammo = 'js/deps/ammo.js';

function init() {
  clock = new THREE.Clock();

  //Physi.js Scene, for physics simulation
  scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
  scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
  scene.addEventListener(
    'update',
    function() {
      scene.simulate( undefined, 2 );
      physicsStats.update();
    }
  );

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000, 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.setPixelRatio(window.devicePixelRatio);

  //create perlin noise plane using Simplex Noise (Perlin Noise)
  var NoiseGen = new SimplexNoise();
  var geometryTerrain = new THREE.PlaneGeometry( 500, 500, 200, 200 );
  for ( var i = 0; i < geometryTerrain.vertices.length; i++ ) {
    var vertex = geometryTerrain.vertices[i];
    var depth = 0;
    if (i % 3 === 0) {
      depth = RAND_MT.Random() - 0.5;
    }
    vertex.z = (NoiseGen.noise( vertex.x/25, vertex.y/25)) * (6 + depth*3);
  }
  geometryTerrain.computeFaceNormals();
  geometryTerrain.computeVertexNormals();

  //Simple Case
  var stoneTexture = THREE.ImageUtils.loadTexture('../img/stone.png');
  stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
  stoneTexture.repeat.set(100, 100);
  var materialTerrain = Physijs.createMaterial(
    new THREE.MeshPhongMaterial({ map: stoneTexture, shading: THREE.SmoothShading}),
    .8,
    .4
  );

  //terrain mesh
  var terrain = new Physijs.HeightfieldMesh( 
    geometryTerrain, 
    materialTerrain,
    0,
    50, 
    50 );
  terrain.position.set( 0, -10, 0 );
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true;

  scene.add( terrain );


  // // now add some better lighting
  var ambientLight = new THREE.AmbientLight(0x111111);
  ambientLight.name = 'ambient';
  scene.add(ambientLight);

  // add sunlight (light
  var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position = new THREE.Vector3(200, 10, -50);
  directionalLight.name = 'directional';
  scene.add(directionalLight);

  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 0;
  camera.lookAt(scene.position);

  // apply VR positional data to camera
  cameraControl = new THREE.VRControls(camera);

  //apply VR stereo rendering to renderer
  effect = new THREE.VREffect(renderer);
  effect.setSize(window.innerWidth, window.innerHeight);

  manager = new WebVRManager(renderer, effect);

  addStatsObject();

  //bg stuff
  // skybox
  var geometryBG = new THREE.CubeGeometry(1000, 1000, 1000);

  var prefix = 'img/';
  var urls = ['posx.jpeg', 'negx.jpeg', 'posy.jpeg', 'negy.jpeg', 'posz.jpeg', 'negz.jpeg'];
  for (var i = 0; i < urls.length; i++) {
    urls[i] = prefix + urls[i];
  }
  var cubemap = THREE.ImageUtils.loadTextureCube(urls);
  cubemap.format = THREE.RGBFormat;

  // Initialize the shader.
  var shader = THREE.ShaderLib['cube'];
  shader.uniforms['tCube'].value = cubemap

  var materialBG = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide
  });

  // Build the skybox Mesh.
  var skybox = new THREE.Mesh(geometryBG, materialBG);
  // Add it to the scene
  this.scene.add(skybox);
  //end skybox

  // Append the canvas element created by the renderer to document body element.
  document.body.appendChild(renderer.domElement);
  // renderer.autoClear = false;
  createShapes();
  scene.simulate();
  render();
}

function render(timestamp) {
  // update stats
  renderStats.update();

  // update the camera
  cameraControl.update();

  //render, using the WebVR Manager
  manager.render(scene, camera, timestamp);

  requestAnimationFrame(render);
}

function addStatsObject() {
  //WebGL render stats
  renderStats = new Stats();
  renderStats.setMode(0);

  renderStats.domElement.style.position = 'absolute';
  renderStats.domElement.style.left = '0px';
  renderStats.domElement.style.top = '0px';

  document.body.appendChild(renderStats.domElement);

  //Physics stats
  physicsStats = new Stats();
  physicsStats.domElement.style.position = 'absolute';
  physicsStats.domElement.style.top = '50px';
  physicsStats.domElement.style.zIndex = 100;
  document.body.appendChild( physicsStats.domElement );
}

function createShapes() {
  var addShapes = true;
  var shapes = 0;
  var numShapes = 0;
  var box_geometry = new THREE.CubeGeometry( 3, 3, 3 );
  var sphere_geometry = new THREE.SphereGeometry( 1.5, 32, 32 );

  function dropShapes() {
    var shape, material = new THREE.MeshLambertMaterial({ opacity: 0, transparent: true });

    switch ( Math.floor(Math.random() * 2) ) {
      case 0:
        shape = new Physijs.BoxMesh(
          box_geometry,
          material
        );
        break;
      
      case 1:
        shape = new Physijs.SphereMesh(
          sphere_geometry,
          material,
          undefined,
          { restitution: Math.random() * 1.5 }
        );
        break;
    }

    shape.material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
    shape.castShadow = true;
    shape.receiveShadow = true;
    
    shape.position.set(
      Math.random() * 30 - 15,
      20,
      Math.random() * 30 - 15
    );
    
    shape.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    if ( addshapes ) {
      shape.addEventListener( 'ready', createShape );
    }
    scene.add( shape );
    numShapes += 1;

    if (numShapes > 10) addshapes = false;
    
    new TWEEN.Tween(shape.material).to({opacity: 1}, 500).start();
    
    document.getElementById('shapecount').textContent = (++shapes) + ' shapes created';
  }
    
  return function() {
    setTimeout( doCreateShape, 250 );
  };
}

/**
 * Function handles the resize event. This make sure the camera and the renderer
 * are updated at the correct moment.
 */
function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// calls the init function when the window is done loading.
window.onload = init;
// calls the handleResize function when the window is resized
window.addEventListener('resize', handleResize, false);

