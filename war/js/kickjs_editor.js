YUI().use('tabview', 'escape', 'plugin', function(Y) {
    var sceneEditorApp = new SceneEditorApp();

    createTabView(Y,sceneEditorApp);
    sceneEditorApp.initEngine();

    createSceneAssets(Y, sceneEditorApp.engine);

    // make engien public available (for debugging purpose)
    window.engine = sceneEditorApp.engine;
});

var VisualGrid = function(){
    var engine,
        gl,
        gridShader,
        gridMesh,
        shaderMaterial,
        transform,
        thisObj = this;

    this.enabled = true;

    this.activated = function(){
        engine = this.gameObject.engine;
        transform = this.gameObject.transform;
        gl = engine.gl;
        gridShader = engine.resourceManager.getShader("kickjs://shader/unlit/");
        shaderMaterial = new KICK.material.Material(engine,{
            name:"Grid",
            shader: gridShader,
            uniforms:{
                mainColor: {
                    value: [.2,.2,.2],
                    type: KICK.core.Constants.GL_FLOAT_VEC3
                },
                mainTexture: {
                    value: engine.resourceManager.getTexture("kickjs://texture/white/"),
                    type: KICK.core.Constants.GL_SAMPLER_2D
                }
            }
        });
        var gridMeshData = new KICK.mesh.MeshData();
        var lines = [];
        var index = [];
        var uvs = [];
        var size = 100;
        for (var i=-size;i<=size;i++){
            // one direction - from
            lines.push(-size);
            lines.push(0);
            lines.push(i);
            // one direction - to
            lines.push(size);
            lines.push(0);
            lines.push(i);
            // one direction - from
            lines.push(i);
            lines.push(0);
            lines.push(-size);
            // one direction - to
            lines.push(i);
            lines.push(0);
            lines.push(size);
            // update indices
            index.push(index.length);
            index.push(index.length);
            index.push(index.length);
            index.push(index.length);
            for (var x=0;x<8;x++){
                uvs.push(0);
            }
        }
        gridMeshData.meshType = KICK.core.Constants.GL_LINES;
        gridMeshData.vertex = lines;
        gridMeshData.indices = index;
        gridMeshData.uv1 = uvs;


        gridMesh = new KICK.mesh.Mesh(engine,{
            name:"GridLines",
            meshData:gridMeshData
        });

        var errors = gridMesh.verify(gridShader);
    };
    this.render = function(engineUniforms,overwriteShader){
        if (thisObj.enabled){
            var shader = overwriteShader || gridShader;
            gridMesh.bind(shader);
            shader.bindUniform(shaderMaterial,engineUniforms,transform);
            gridMesh.render(0);
        }
    };
};

var CameraNavigator = function(){
    var transform,
        mouseInput,
        euler = KICK.math.vec3.create();
    this.activated = function(){
        transform = this.gameObject.transform;
        mouseInput = this.gameObject.engine.mouseInput;
        mouseInput.mouseWheelPreventDefaultAction = true;
    };

    this.update = function(){
        if (mouseInput.isButton(2)){
            var mousePosDelta = mouseInput.deltaMovement;
            var hasMovement = mousePosDelta[0] || mousePosDelta[1];
            if (hasMovement){
                var mouseSensitivity = 0.1;
                euler[0] += mousePosDelta[1]*mouseSensitivity;
                euler[1] += mousePosDelta[0]*mouseSensitivity;
                transform.localRotationEuler = euler;
            }
        } else if (mouseInput.isButton(1)){
            var mousePosDelta = mouseInput.deltaMovement;
            var hasMovement = mousePosDelta[0] || mousePosDelta[1];
            if (hasMovement){
                var mousePanSensitivity = 0.01;
                var movement = [-mousePanSensitivity*mousePosDelta[0],mousePanSensitivity*mousePosDelta[1],0];
                var rotation = transform.rotation;
                movement = KICK.math.quat4.multiplyVec3(rotation,movement);
                var pos = transform.position;
                pos = KICK.math.vec3.add(pos,movement);
                transform.position = pos;
            }
        }
        var wheelDelta = mouseInput.deltaWheel;
        if (wheelDelta[1]){
            var mouseScrollWheelSensitivity = 0.01;
            var forward = [0,0,-mouseScrollWheelSensitivity*wheelDelta[1]];
            var rotation = transform.rotation;
            forward = KICK.math.quat4.multiplyVec3(rotation,forward);
            var pos = transform.position;
            pos = KICK.math.vec3.add(pos,forward);
            transform.position = pos;
        }
    };
};

var SceneEditorApp = function(){
    var engine = new KICK.core.Engine('sceneView',
        {
            enableDebugContext: true
        }),
        editorSceneCameraObject,
        editorSceneCameraComponent,
        editorSceneGridObject,

        decorateScene = function(scene){
            editorSceneCameraObject = scene.createGameObject();
            editorSceneCameraObject.name = "__editorSceneCameraObject__";
            editorSceneCameraObject.transform.position = [0,0,10];
            editorSceneCameraComponent = new KICK.scene.Camera({
                clearColor : [0.1,0.1,0.15,1.0]
            });
            editorSceneCameraObject.addComponent(editorSceneCameraComponent);
            editorSceneCameraObject.addComponent(new CameraNavigator());

            editorSceneGridObject = scene.createGameObject();
            editorSceneGridObject.name = "__editorSceneGridObject__";
            editorSceneGridObject.addComponent(new VisualGrid());

            // create material
            var material = new KICK.material.Material(engine,{
                shader: engine.resourceManager.getShader("kickjs://shader/unlit/"),
                uniforms:{
                    mainColor: {
                        value: [1,1,1],
                        type: KICK.core.Constants.GL_FLOAT_VEC3
                    },
                    mainTexture: {
                        value: engine.resourceManager.getTexture("kickjs://texture/white/"),
                        type: KICK.core.Constants.GL_SAMPLER_2D
                    }
                }
            });

            // create meshes
            var meshes = ["kickjs://mesh/triangle/","kickjs://mesh/cube/"];
            for (var i=0;i<meshes.length;i++){
                var gameObject = scene.createGameObject();
                gameObject.transform.position = [-2.0+4*i,0,0];
                var meshRenderer = new KICK.scene.MeshRenderer();
                meshRenderer.mesh = engine.resourceManager.getMesh(meshes[i]);
                meshRenderer.material = material;
                gameObject.addComponent(meshRenderer);
            }
        };

    Object.defineProperties(this,{
        engine:{
            get:function(){
                return engine;
            }
        }
    });

    this.loadProject = function(){

    };

    this.saveProject = function(){

    };

    this.deleteProject = function(){

    };

    this.loadResource = function(){

    };

    this.saveResource = function(){

    };

    this.listProjects = function(){

    };

    this.initEngine = function(){
        engine.canvasResized();
        decorateScene(engine.activeScene);
    }
};


function createSceneAssets(Y,engine){
    var sceneContentList = document.getElementById('sceneContentList'),
        thisObj = this;

    this.updateSceneContent = function(){
        var needsUpdate = false,
            usedValuesCount = 0,
            usedValues = {},
            activeScene,
            i;
        for (i=0;i<sceneContentList.options.length;i++){
            var id = sceneContentList.options[i].value;
            usedValuesCount++;
            usedValues[id] = true;
        }

        activeScene = engine.activeScene;
        for (i=activeScene.numberOfComponents - 1;i>=0;i--){
//            var gameObject = activeScene.
        }
    };
    this.updateSceneContent();
}

function createTabView(Y,sceneEditorApp){
    var Removeable = function(config) {
        Removeable.superclass.constructor.apply(this, arguments);
    };

    Removeable.NAME = 'removeableTabs';
    Removeable.NS = 'removeable';

    Y.extend(Removeable, Y.Plugin.Base, {
        REMOVE_TEMPLATE: '<a class="yui3-tab-remove" title="remove tab">x</a>',

        initializer: function(config) {
            var tabview = this.get('host'),
                cb = tabview.get('contentBox');

            cb.addClass('yui3-tabview-removeable');
            cb.delegate('click', this.onRemoveClick, '.yui3-tab-remove', this);

            // Tab events bubble to TabView
            tabview.after('tab:render', this.afterTabRender, this);
        },
        afterTabRender: function(e) {
            if (e.target.get('index') !== 0){
                // boundingBox is the Tab's LI
                e.target.get('boundingBox').append(this.REMOVE_TEMPLATE);
            }
        },
        onRemoveClick: function(e) {
            e.stopPropagation();
            var tab = Y.Widget.getByNode(e.target);
            tab.remove();
        }
    });

    var tabview = new Y.TabView({
        srcNode: '#mainTabContainer',
        children: [{
            label: 'Scene',
            content: ''
        },
        {
            label: 'Test',
            content: ''
        }
        ],
        plugins: [Removeable]
    });
    tabview.render();

    // Since a canvas does not work well inside a Treeview, it is added after the treeview and then hidden whenever the
    // selected index is not 0
    function adjustView(){
        sceneView.style.display = "inline";
        sceneView.width = sceneView.clientWidth;
        sceneView.height = sceneView.clientHeight;
        sceneEditorApp.engine.canvasResized();
    }
    adjustView();

    tabview.on("selectionChange", function(e){
        var sceneView = document.getElementById('sceneView');
        switch (e.newVal.get('index')){
            case 0:
                adjustView();
                if (sceneEditorApp.paused){
                    sceneEditorApp.paused = false;
                }
                break;
            default:
                sceneView.style.display = "none";
                sceneEditorApp.paused = true;
                break;

        }
    });

};