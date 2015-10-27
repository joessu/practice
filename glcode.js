Qt.include("three.js")

/*
 * "Functional" HMI 3D Material Demo
 *
 * The following demo shows how a 3D HMI Interface could provide quick, clear information
 * to a driver. One neat thing about this demo in particular is that it seemlessly integrates
 * with QML and QTQuick, allowing for integration with 2d controls.
 *
 * Perhaps one limitation of going this route is performance of a fully implemented 3d system
 * with many materials, animations, and controls.
 *
 */

var camera, scene, renderer;
var mesh, rot;
var currentRotation;
var currentTime = 0;
var toRad = (Math.PI/180)
var clock = new THREE.Clock();
var uniforms;

function initializeGL(canvas) {

    THREE.ShaderLib['redflash'] = {
        vertexShader: [
            "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
            "void main() {",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);",
            "}"
        ].join("\n"),

        fragmentShader: [

        "uniform float time;",
        "void main() {",
        "gl_FragColor = vec4( 0.5+(sin(time*10.0)), 0.0, 0.0, 1.0);", //popular way to make a thing flashy
        "}"
        ].join("\n")
    };

    clock.start();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    //decent camera angle.
    camera.position.z = 5;
    camera.position.y = 4;
    //As Opposed to animating the car mesh, I could also animate the camera. Perhaps out of scope for this example.
    //If I were to use the camera, I would most certainly do it with quaternions.
    //camera.useQuaternion = true;

    var loader = new THREE.JSONLoader();
    loader.load("car.js", function ( geometry, materials ) {

        //This output allowed me to inspect the materials for the mesh and swap them for my own.
        //for(var i = 0, len = materials.length; i < len; i++)
        //    console.log(i + "---" + JSON.stringify(materials[i]));

        //This uniform allows the tires to pulse
        uniforms = { time: { type: "f", value: 1 } };
        var flashingShader = THREE.ShaderLib[ "redflash" ];
        var vertexShader = flashingShader.vertexShader;
        var fragmentShader = flashingShader.fragmentShader;

        //Note: With this model I did not have access to individual tires :(
        //tire tred geometry's material
        materials[38] = new THREE.ShaderMaterial( { uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader } );
        //tire sidewall geometry's material
        materials[39] = new THREE.ShaderMaterial( { uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader } );

        mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );

        //initial position, rotation, scale
        mesh.rotation.set(-90,0,0);
        mesh.position.set(0, -2, 0);
        mesh.scale.set(2.25,2.25,2.25);

        //this might not be needed.
        //mesh.matrixAutoUpdate = true;
        scene.add( mesh );
        camera.lookAt(mesh.position);
    });

    //let there be light, of the soft white ambient kind.
    var light = new THREE.AmbientLight( 0x404040 );
    scene.add( light );

    //this point light gives shape to the mesh.
    var pointLight = new THREE.PointLight( 0x959595, 1, 100 );
    pointLight.position.set( 0, 5, 5);
    scene.add( pointLight );

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });

    renderer.setSize(canvas.width, canvas.height);
}

function resizeGL(canvas) {
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(canvas.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);
}

function paintGL(canvas) {

    //Not the most ideal way to do an animation, however I like to keep things simple when possible/
    //I'd like this better if I could move this line into the animateMesh function (controlled by qml)
    //but there were update issues when I did that
    if(mesh) {
        mesh.rotation.set(-90,0,lerp(0, -75*toRad, currentTime));
    }

    //Set the uniform so we can have flashy tires. I do admitedly cheat by hiding the tires in the first view.
    //A number of things could be done to solve this, like allowing the color to be controlled or augmenting the
    //lambert material itself instead of replacing it.
    if (uniforms) {
        uniforms.time.value = clock.getElapsedTime()
    }

    renderer.render(scene, camera);
}

function lerp(v0, v1, t) {
  return (1-t)*v0 + t*v1;
}

//entry point for simple qml controlled animation, used to move the mesh around.
function animateMesh(time) {
    currentTime = time;
}

