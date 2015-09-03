// global variables
var renderer;
var camera, scene;
var cameraOrtho, sceneRenderTarget;
var control;
var stats;
var cameraControl;
var effect;
var manager;
var clock;

var updateNoise = true;

var uniformsNoise, uniformsNormal,
        heightMap, normalMap,
        quadTarget;

function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000, 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);

  //create perlin noise plane
  // HEIGHT + NORMAL MAPS

  //Simple Case
  var stoneTexture = THREE.ImageUtils.loadTexture('../img/stone.png');
  stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
  stoneTexture.repeat.set(100, 100);
  var materialTerrain = new THREE.MeshBasicMaterial({ 
    map: stoneTexture
  });


  //terrain geometry
  var geometryTerrain = new THREE.PlaneBufferGeometry( 6000, 6000, 256, 256 );
  geometryTerrain.computeTangents();

  //terrain mesh
  var terrain = new THREE.Mesh( geometryTerrain, materialTerrain );
  terrain.position.set( 0, -125, 0 );
  terrain.rotation.x = -Math.PI / 2;
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

  camera.position.x = 10;
  camera.position.y = 10;
  camera.position.z = 10;
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

  // Append the canvas element created by the renderer to document body element.
  document.body.appendChild(renderer.domElement);
  renderer.autoClear = false;
  render();
}

function render(timestamp) {
  // update stats
  stats.update();

  // update the camera
  cameraControl.update();

  //Some stuff that one day, I will understand what it does
  var delta = clock.getDelta();

  if (updateNoise) {
    uniformsNoise[ "offset" ].value.x += delta * 0.05;
    uniformsTerrain[ "uOffset" ].value.x = 4 * uniformsNoise[ "offset" ].value.x;

    quadTarget.material = mlib[ "heightmap" ];
    renderer.render( sceneRenderTarget, cameraOrtho, heightMap, true );

    quadTarget.material = mlib[ "normal" ];
    renderer.render( sceneRenderTarget, cameraOrtho, normalMap, true );
    updateNoise = false;
  }


  //render, using the WebVR Manager
  manager.render(scene, camera, timestamp);

  requestAnimationFrame(render);
}

function addStatsObject() {
  stats = new Stats();
  stats.setMode(0);

  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.body.appendChild(stats.domElement);
}

function applyShader( shader, texture, target ) {

  var shaderMaterial = new THREE.ShaderMaterial( {

    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: THREE.UniformsUtils.clone( shader.uniforms )

  } );

  shaderMaterial.uniforms[ "tDiffuse" ].value = texture;

  var sceneTmp = new THREE.Scene();

  var meshTmp = new THREE.Mesh( new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight ), shaderMaterial );
  meshTmp.position.z = -500;

  sceneTmp.add( meshTmp );

  renderer.render( sceneTmp, camera, target, true );

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

