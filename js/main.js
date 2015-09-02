// global variables
var renderer;
var scene;
var camera;
var control;
var stats;
var cameraControl;
var effect;
var manager;
var clock;
var dolly;

function init() {
  clock = new THREE.Clock();

  scene = new THREE.Scene();

  dolly = new THREE.Group();
  dolly.position.set( 10000, 10000, 10000 );

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  // camera.position.z = 0.0001;
  // dolly.add( camera );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000, 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);

  //create perlin noise plane


  // // now add some better lighting
  // var ambientLight = new THREE.AmbientLight(0x111111);
  // ambientLight.name = 'ambient';
  // scene.add(ambientLight);

  // // add sunlight (light
  // var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  // directionalLight.position = new THREE.Vector3(200, 10, -50);
  // directionalLight.name = 'directional';
  // scene.add(directionalLight);

  // lights

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.15 );
  directionalLight.position.set( -1, 1, -1 );
  scene.add( directionalLight );

  var hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.8 );
  hemisphereLight.position.set( -1, 2, 1.5 );
  scene.add( hemisphereLight );

  camera.position.x = 25;
  camera.position.y = 10;
  camera.position.z = 63;
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
  render();
}

function render(timestamp) {
  // update stats
    stats.update();

  // update the camera
  cameraControl.update();

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

