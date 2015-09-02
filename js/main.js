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
var mlib = {};

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
  // HEIGHT + NORMAL MAPS

  // var normalShader = THREE.NormalMapShader;

  // var rx = 256, ry = 256;
  // var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

  // heightMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
  // heightMap.generateMipmaps = false;

  // normalMap = new THREE.WebGLRenderTarget( rx, ry, pars );
  // normalMap.generateMipmaps = false;

  // uniformsNoise = {

  //   time:   { type: "f", value: 1.0 },
  //   scale:  { type: "v2", value: new THREE.Vector2( 1.5, 1.5 ) },
  //   offset: { type: "v2", value: new THREE.Vector2( 0, 0 ) }

  // };

  // uniformsNormal = THREE.UniformsUtils.clone( normalShader.uniforms );

  // uniformsNormal.height.value = 0.05;
  // uniformsNormal.resolution.value.set( rx, ry );
  // uniformsNormal.heightMap.value = heightMap;

  // var vertexShader = document.getElementById( 'vertexShader' ).textContent;

  // // TEXTURES

  // var specularMap = new THREE.WebGLRenderTarget( 2048, 2048, pars );
  // specularMap.generateMipmaps = false;

  // var diffuseTexture1 = THREE.ImageUtils.loadTexture( "../img/stone.png", null, function () {

  //   // loadTextures();
  //   applyShader( THREE.LuminosityShader, diffuseTexture1, specularMap );

  // } );

  // // var diffuseTexture2 = THREE.ImageUtils.loadTexture( "textures/terrain/backgrounddetailed6.jpg", null, loadTextures );
  // // var detailTexture = THREE.ImageUtils.loadTexture( "textures/terrain/grasslight-big-nm.jpg", null, loadTextures );

  // diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
  // // diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
  // // detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
  // specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;

  // // TERRAIN SHADER

  // var terrainShader = THREE.ShaderTerrain[ "terrain" ];

  // uniformsTerrain = THREE.UniformsUtils.clone( terrainShader.uniforms );

  // uniformsTerrain[ "tNormal" ].value = normalMap;
  // uniformsTerrain[ "uNormalScale" ].value = 3.5;

  // uniformsTerrain[ "tDisplacement" ].value = heightMap;

  // uniformsTerrain[ "tDiffuse1" ].value = diffuseTexture1;
  // // uniformsTerrain[ "tDiffuse2" ].value = diffuseTexture2;
  // uniformsTerrain[ "tSpecular" ].value = specularMap;
  // // uniformsTerrain[ "tDetail" ].value = detailTexture;

  // uniformsTerrain[ "enableDiffuse1" ].value = true;
  // uniformsTerrain[ "enableDiffuse2" ].value = true;
  // uniformsTerrain[ "enableSpecular" ].value = true;

  // uniformsTerrain[ "diffuse" ].value.setHex( 0xffffff );
  // uniformsTerrain[ "specular" ].value.setHex( 0xffffff );

  // uniformsTerrain[ "shininess" ].value = 30;

  // uniformsTerrain[ "uDisplacementScale" ].value = 375;

  // uniformsTerrain[ "uRepeatOverlay" ].value.set( 6, 6 );

  // var params = [
  //   [ 'heightmap',  document.getElementById( 'fragmentShaderNoise' ).textContent,   vertexShader, uniformsNoise, false ],
  //   [ 'normal',   normalShader.fragmentShader,  normalShader.vertexShader, uniformsNormal, false ],
  //   [ 'terrain',  terrainShader.fragmentShader, terrainShader.vertexShader, uniformsTerrain, true ]
  //  ];

  // for( var i = 0; i < params.length; i ++ ) {

  //   material = new THREE.ShaderMaterial( {

  //     uniforms:     params[ i ][ 3 ],
  //     vertexShader:   params[ i ][ 2 ],
  //     fragmentShader: params[ i ][ 1 ],
  //     lights:     params[ i ][ 4 ],
  //     fog:      true
  //     } );

  //   mlib[ params[ i ][ 0 ] ] = material;

  // }
  var stoneTexture = THREE.ImageUtils.loadTexture('../img/stone2.png');
  stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
  stoneTexture.repeat.set(100, 100);
  var materialTerrain = new THREE.MeshBasicMaterial({ 
    map: stoneTexture
  });



  //terrain geometry
  var geometryTerrain = new THREE.PlaneBufferGeometry( 6000, 6000, 256, 256 );
  geometryTerrain.computeTangents();

  // //terrain mesh
  // // var terrain = new THREE.Mesh( geometryTerrain, mlib[ "terrain" ] );
  var terrain = new THREE.Mesh( geometryTerrain, materialTerrain );
  terrain.position.set( 0, -125, 0 );
  terrain.rotation.x = -Math.PI / 2;
  // terrain.visible = false;
  scene.add( terrain );


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

