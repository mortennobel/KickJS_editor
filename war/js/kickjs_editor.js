YUI({
    //Last Gallery Build of this module
    gallery: 'gallery-2011.01.03-18-30'
}).use('tabview', 'escape', 'plugin', 'gallery-yui3treeview', function(Y) {
    var sceneEditorApp = new SceneEditorApp();

    createTabView(Y,sceneEditorApp);
    sceneEditorApp.initEngine();

    var sceneAssets = new SceneGameObjects(Y, sceneEditorApp);
    sceneEditorApp.sceneAssets = sceneAssets;

    var projectAssets = ProjectAssets(Y,sceneEditorApp.engine);
    sceneEditorApp.projectAssets = projectAssets;

    // make engien public available (for debugging purpose)
    window.engine = sceneEditorApp.engine;
});

var SceneEditorView = function(sceneEditorApp){
    var engine = new KICK.core.Engine('sceneView',
        {
            enableDebugContext: true
        }),
        editorSceneCameraObject,
        editorSceneCameraComponent,
        editorSceneGridObject;

    this.decorateScene = function(scene){
            editorSceneCameraObject = scene.createGameObject();
            editorSceneCameraObject.name = "__editorSceneCameraObject__";
            editorSceneCameraObject.transform.position = [0,1,10];
            editorSceneCameraComponent = new KICK.scene.Camera({
                clearColor : [0.1,0.1,0.15,1.0]
            });
            editorSceneCameraObject.addComponent(editorSceneCameraComponent);
            editorSceneCameraObject.addComponent(new CameraNavigator(sceneEditorApp));

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
};

var SceneEditorApp = function(){
    var _view = new SceneEditorView(this),
        _sceneAssets;

    Object.defineProperties(this,{
        sceneAssets:{
            get:function(){
                return _sceneAssets;
            },
            set:function(v){
                _sceneAssets = v;
            }
        },
        view:{
            get:function(){
                return _view;
            }
        },
        engine:{
            get:function(){
                return _view.engine;
            }
        }
    });

    this.gameObjectSelected = function(uid){
        _sceneAssets.selectGameObject(uid);
        console.debug("gameObjectSelected "+uid);
    };

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
        _view.decorateScene(_view.engine.activeScene);
        _view.engine.canvasResized();
    }
};

function SceneGameObjects(Y,sceneEditorApp){
    var engine = sceneEditorApp.engine,
        sceneContentList = document.getElementById('sceneContentList'),
        thisObj = this;

    var sceneTreeView = new Y.TreeView({
        srcNode: '#sceneContentList',
        contentBox: null,
        type: "TreeView",
        children: []
    });

    sceneTreeView.render();

    this.updateSceneContent = function(){
        var needsUpdate = false,
            treeValues = {},
            activeSceneUids = {},
            activeScene,
            i;

        // save used elements to treeValues
        for (i=sceneTreeView.size()-1;i>=0;i--){
            var element = sceneTreeView.item(i);
            treeValues[element.get("uid")] = element;
        }

        // save all uid to activeSceneUids
        activeScene = engine.activeScene;
        for (i=activeScene.getNumberOfGameObjects() - 1;i>=0;i--){
            var gameObject = activeScene.getGameObject(i);
            activeSceneUids[gameObject.uid] = gameObject;
        }

        // insert missing uids
        for (var uid in activeSceneUids){
            if (!treeValues[uid]){
                var gameObject = activeSceneUids[uid];
                var name = gameObject.name;
                if (!name){
                    name = "GameObject #"+gameObject.uid;
                }
                if (name.indexOf('__')!==0){
                    var list = sceneTreeView.add({childType:"TreeLeaf",label:name});
                    list.item(0).set("uid",uid);
                }
            }
        }
        // delete uids not in scene
        for (var uid in treeValues){
            if (!activeSceneUids[uid]){
                var node = treeValues[uid];
                sceneTreeView.remove(node.get("index"));
            }
        }
    };

    this.selectGameObject = function(uid){
        for (i=sceneTreeView.size()-1;i>=0;i--){
            var element = sceneTreeView.item(i);
            if (parseInt(element.get("uid")) === uid){
                element.set("selected", 1); // full selected
                element.focus();
                return;
            }
        }
    };

    sceneTreeView.on("treeleaf:click",function(e){
        var uid = e.target.get("uid");
        sceneEditorApp.gameObjectSelected(uid);
    });

    this.updateSceneContent();
}

function ProjectAssets(Y, engine){
    var projectTreeView = new Y.TreeView({
        srcNode: '#projectAssetList',
        contentBox: null,
        type: "TreeView",
        children: [
            {label:"test"}
        ]
    });

    projectTreeView.render();

    this.updateSceneContent = function(){
        var project = engine.project,
            activeProjectUidList = project.resourceDescriptorUIDs,
            activeProjectUids = {},
            treeValues = {};

        // save used elements to treeValues
        for (i=projectTreeView.size()-1;i>=0;i--){
            var element = projectTreeView.item(i);
            treeValues[element.get("uid")] = element;
        }

        // save elements in tree
        for (i=activeProjectUidList.length-1;i>=0;i--){
            activeProjectUids[activeProjectUidList[i]] = true;
        }

        // insert missing uids
        for (var uid in activeProjectUids){
            if (!treeValues[uid]){
                var resourceDescriptor = project.getResourceDescriptor(uid);
                var name = resourceDescriptor.name;
                if (!name){
                    name = "Asset #"+resourceDescriptor.uid;
                }
                var type = resourceDescriptor.type;
                type = type.substring(type.lastIndexOf('.')+1);
                name += " ("+type+")";
                if (name.indexOf('__')!==0){
                    var list = projectTreeView.add({childType:"TreeLeaf",label:name});
                    list.item(0).set("uid",uid);
                }
            }
        }
        // delete uids not in scene
        for (var uid in treeValues){
            if (!activeProjectUids[uid]){
                var node = treeValues[uid];
                projectTreeView.remove(node.get("index"));
            }
        }
    };

    this.updateSceneContent();

    projectTreeView.on("treeleaf:click",function(e){
        var uid = e.target.get("uid");
        console.log("uid "+uid+" selected"); // todo implement
    });
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
}
