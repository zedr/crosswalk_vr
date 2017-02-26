/* jshint
 esnext: true
 */

(function () {
    "use strict";

    const THREE = window.THREE,
        webvrui = window.webvrui,
        uiOptions = {
            color: 'black',
            background: 'white',
            corners: 'square'
        },
        World = {
            create: (x, y, w, h) => {
                const world = Object.create(World),
                    geo = new THREE.PlaneBufferGeometry(x, y, w, h),
                    mat = new THREE.MeshLambertMaterial(
                        {
                            color: 0xffaaaa, wireframe: true
                        }
                    ),
                    mesh = new THREE.Mesh(geo, mat);

                geo.dynamic = true;

                world.mesh = mesh;
                world.dimensions = {
                    x: x,
                    y: y,
                    w: w,
                    h: h
                };
                world.adjustOrientation();

                return world;
            },
            createFromMatrix: function (matrix) {
                // The matrix needs to have the dimensions of a square.
                const w = matrix.length,
                    h = matrix[0].length,
                    world = World.create(w, w, w, h);

                for (let y = 0; y < w; y++) {
                    for (let x = 0; x < w; x++) {
                        let ch = matrix[y][x];
                        if (ch) {
                            world.setTileHeight(x + 1, y + 1, ch);
                        }
                    }
                }

                return world;
            },
            get _varray() {
                return this.mesh.geometry.attributes.position.array;
            },
            adjustOrientation: function () {
                this.mesh.rotation.x = -90 * Math.PI / 180;
            },
            update: function () {
                this.mesh.geometry.attributes.position.needsUpdate = true;
            },
            getVertexByNum: function (num) {
                return (num * 3) - 1;
            },
            setVertexHeight: function (num, height) {
                this._varray[this.getVertexByNum(num)] = height;
            },
            setTileHeight: function (x, y, height) {
                const w = this.dimensions.w,
                    v1 = (x + ((w + 1) * (y - 1))),
                    v2 = v1 + 1,
                    v3 = v2 + w,
                    v4 = v3 + 1;

                [v1, v2, v3, v4].forEach(
                    (vnum) => this.setVertexHeight(vnum, height)
                );
            }
        }

    let vrDisplay,
        vrButton,
        scene,
        camera,
        controls,
        effect;

    function populate(scene, matrix) {
        const world = World.createFromMatrix(matrix),
            ambLight = new THREE.AmbientLight(0xffffff, 0.25),
            ptLight = new THREE.PointLight(0xffffff, 1);

        world.mesh.position.z -= 7;
        world.mesh.position.y -= 3;

        scene.add(ambLight);
        scene.add(ptLight);
        scene.add(world.mesh);

        window.world = world;
    }

    function setupUi(parentEl) {
        vrButton = new webvrui.EnterVRButton(parentEl, uiOptions);
        vrButton.on('exit', function () {
            camera.quaternion.set(0, 0, 0, 1);
            camera.position.set(0, controls.userHeight, 0);
        });
        vrButton.on('hide', function () {
            document.getElementById('ui').style.display = 'none';
        });
        vrButton.on('show', function () {
            document.getElementById('ui').style.display = 'inherit';
        });
        document.getElementById('vr-button').appendChild(vrButton.domElement);
        document.getElementById('magic-window').addEventListener('click', function () {
            vrButton.requestEnterFullscreen();
        });
    }

    function render() {
        window.world.mesh.rotation.z += 0.01;
        if (vrButton.isPresenting()) {
            controls.update();
        }
        effect.render(scene, camera);
        vrDisplay.requestAnimationFrame(render);
    }

    function initialise(matrix) {
        const renderer = new THREE.WebGLRenderer({
            antialias: true
        }),
            aspect = window.innerWidth / window.innerHeight;

        camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
        // Apply VR stereo rendering to renderer.
        effect = new THREE.VREffect(renderer);
        scene = new THREE.Scene();
        controls = new THREE.VRControls(camera);
        controls.standing = true;
        camera.position.y = controls.userHeight;
        effect.setSize(window.innerWidth / window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        populate(scene, matrix);

        document.body.appendChild(renderer.domElement);

        function onResize() {
            effect.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }

        setupUi(renderer.domElement);

        navigator.getVRDisplays().then(function (displays) {
            if (displays.length > 0) {
                vrDisplay = displays[0];
                vrDisplay.requestAnimationFrame(render);
            } else {
                window.console.log("Error: no usable displays found.");
            }
        });

        window.addEventListener('resize', onResize, true);
        window.addEventListener('vrdisplaypresentchange', onResize, true);
    }

    window.initGame = initialise;

}());
