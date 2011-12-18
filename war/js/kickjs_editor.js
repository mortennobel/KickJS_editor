YUI().use('tabview', 'escape', 'plugin', function(Y) {
    var sceneEditorApp = new SceneEditorApp();

    createTabView(Y,sceneEditorApp);
    sceneEditorApp.initEngine();

    createSceneAssets(Y, sceneEditorApp.engine);

    // make engien public available (for debugging purpose)
    window.engine = sceneEditorApp.engine;
});

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
                console.log("Rotation!!!! ",KICK.math.vec3.str(transform.rotationEuler));
                var mouseSensitivity = 0.1;
                euler[0] += mousePosDelta[1]*mouseSensitivity;
                euler[1] += mousePosDelta[0]*mouseSensitivity;
                transform.localRotationEuler = euler;
                console.log("RotationPost ",KICK.math.vec3.str(transform.rotationEuler));
            }
        }
        var wheelDelta = mouseInput.deltaWheel;
        if (wheelDelta[1]){
            var mouseScrollWheelSensitivity = 0.01;
            var forward = [0,0,-mouseScrollWheelSensitivity*wheelDelta[1]];
            var rotation = transform.rotation;
            forward = KICK.math.quat4.multiplyVec3(rotation,forward);
            var pos = transform.position;
            console.log("Po_", KICK.math.vec3.str(pos),"Fwd",KICK.math.vec3.str(forward),"Rot",KICK.math.vec3.str(transform.rotationEuler));
            pos = KICK.math.vec3.add(pos,forward);
            console.log("Pos", KICK.math.vec3.str(pos),"Fwd",KICK.math.vec3.str(forward),"Rot",KICK.math.vec3.str(transform.rotationEuler));
            transform.position = pos;
            console.log("PoZ", KICK.math.vec3.str(pos),"Fwd",KICK.math.vec3.str(forward),"Rot",KICK.math.vec3.str(transform.rotationEuler));
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

        decorateScene = function(scene){
            editorSceneCameraObject = scene.createGameObject();
            editorSceneCameraObject.name = "__editorSceneCameraObject__";
            editorSceneCameraObject.transform.position = [0,0,10];
            editorSceneCameraComponent = new KICK.scene.Camera({
                clearColor : [0.1,0.1,0.15,1.0]
            });
            editorSceneCameraObject.addComponent(editorSceneCameraComponent);
            editorSceneCameraObject.addComponent(new CameraNavigator());

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

        }
    }
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