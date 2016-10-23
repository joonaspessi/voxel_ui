var container;
var camera, scene, renderer;
var plane, cube;
var mouse, raycaster, isShiftDown = false;

var rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial;
var controls;

var objects = [];

const VOXEL_SIZE = 10;

init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'Automation UI Voxel ui creator - webgl<br><strong>click</strong>: add component, <strong>shift + click</strong>: remove component';
    container.appendChild( info );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 800, 700, 1000 );
    camera.lookAt( new THREE.Vector3() );

    scene = new THREE.Scene();



    // roll-over helpers

    rollOverGeo = new THREE.BoxGeometry( VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    scene.add( rollOverMesh );

    // cubes

    cubeGeo = new THREE.BoxGeometry( VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE );
    cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c } );

    // grid

    var size = VOXEL_SIZE * 50;
    var step = VOXEL_SIZE;

    var geometry = new THREE.Geometry();

    const gridSize = size / 2;
    for ( var i = - gridSize; i <= gridSize; i += step ) {
        geometry.vertices.push( new THREE.Vector3( - gridSize, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(   gridSize, 0, i ) );

        geometry.vertices.push( new THREE.Vector3( i, 0, - gridSize ) );
        geometry.vertices.push( new THREE.Vector3( i, 0,   gridSize ) );

    }

    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );

    var line = new THREE.LineSegments( geometry, material );
    scene.add( line );

    //

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var geometry = new THREE.PlaneBufferGeometry( size, size );
    geometry.rotateX( - Math.PI / 2 );

    plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x00ff00, visible: true, transparent: true, opacity: 0.1 } ) );
    scene.add( plane );

    objects.push( plane );

    // Lights

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
    scene.add( directionalLight );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        var intersect = intersects[ 0 ];
        rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
        rollOverMesh.position.divideScalar( VOXEL_SIZE ).floor().multiplyScalar( VOXEL_SIZE ).addScalar( VOXEL_SIZE / 2 );

    }
}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        var intersect = intersects[ 0 ];

        // delete cube

        if ( isShiftDown ) {

            if ( intersect.object != plane ) {

                scene.remove( intersect.object );

                objects.splice( objects.indexOf( intersect.object ), 1 );

            }

        // create cube

        } else {

            var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
            voxel.position.copy( intersect.point ).add( intersect.face.normal );
            voxel.position.divideScalar(VOXEL_SIZE).floor().multiplyScalar(VOXEL_SIZE).addScalar(VOXEL_SIZE/2);
            scene.add( voxel );

            objects.push( voxel );

        }

        render();

    }

}

function onDocumentKeyDown( event ) {

    switch( event.keyCode ) {

        case 16: isShiftDown = true; break;

    }

}

function onDocumentKeyUp( event ) {

    switch ( event.keyCode ) {

        case 16: isShiftDown = false; break;

    }

}

function animate() {
    requestAnimationFrame( animate );
    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
    render();
}

function render() {
    renderer.render( scene, camera );
}