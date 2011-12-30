var getParameter = function(name){
    var hashString = location.hash;
    var getOriginalParameter = function(name){
        if (hashString.length==0){
            return null;
        }
        hashString = hashString.substring(1);
        var elements = hashString.split("&");
        for (var i=0;i<elements.length;i++){
            if (elements[i].indexOf(name+"=")==0){
                return elements[i].split("=")[1];
            }
        }
        return null;
    };
    getParameter = getOriginalParameter;
    return getOriginalParameter(name);
};

var serverObject = getParameter("useServer")==="true"? KICKED.server:KICKED.localStorage;
var projectName = getParameter("project");
var debug = getParameter("debug")==="true";

YUI({
    //Last Gallery Build of this module
    gallery: 'gallery-2011.01.03-18-30'
})
    .use('tabview', 'escape', 'plugin', 'gallery-yui3treeview',"widget", "widget-position", "widget-stdmod", 'node-menunav', function(Y) {
        var sceneEditorApp = new SceneEditorApp(Y);

        tabView = new TabView(Y,sceneEditorApp);
        sceneEditorApp.initEngine();

        sceneEditorApp.sceneGameObjects = new SceneGameObjects(Y, sceneEditorApp);

        sceneEditorApp.projectAssets = new ProjectAssets(Y,sceneEditorApp);

        sceneEditorApp.propertyEditor = new PropertyEditor(Y,sceneEditorApp);

        // make engien public available (for debugging purpose)
        window.engine = sceneEditorApp.engine;

        var menus =["#sceneGameObjectMenu","#projectAssetMenu","#propertyPanelMenu","#mainViewMenu"];
        for (var i=0;i<menus.length;i++){
            var menu = Y.one(menus[i]);
            menu.plug(Y.Plugin.NodeMenuNav, {autoSubmenuDisplay:false});
        }

        function loadProject(){
            var onError = function(errorObj){
                alert("Error loading project");
                console.log(errorObj);
            };

            var onResourceLoadSuccess = function(content){
                var isError = content.status; // .status only available on errorObject
                var sceneReady = function(){
                    Y.one("#loadingPanel").addClass("hiddenContent");
                    Y.one("#layout").removeClass("hiddenContent");
                    tabView.adjustView();
                };
                if (isError){
                    sceneEditorApp.createDefaultScene();
                    sceneEditorApp.projectSave(sceneReady,onError,true);
                } else {
                    sceneEditorApp.projectLoad(content);
                    sceneReady();
                }
            };

            var onProjectLoad = function(resp){
                console.log(resp.response);
                serverObject.resource.load(projectName, 0,onResourceLoadSuccess, onResourceLoadSuccess,true);
            };

            serverObject.project.load(projectName, onProjectLoad, onError);
        }

        loadProject();
});


var SceneEditorView = function(Y,sceneEditorApp){
    var canvas = Y.one("#sceneView"),
        engine = new KICK.core.Engine('sceneView',
        {
            enableDebugContext: true
        }),
        editorSceneCameraObject,
        editorSceneCameraComponent,
        editorSceneGridObject;

        Y.one("window").on("resize", function(){
            canvas.set("width",canvas.get("clientWidth"));
            canvas.set("height",canvas.get("clientHeight"));
            engine.canvasResized();
        });

    this.createDefaultScene = function (scene) {
        // create material
        var materials = [
            new KICK.material.Material(engine, {
                name:"White material",
                shader:engine.resourceManager.getShader("kickjs://shader/unlit/"),
                uniforms:{
                    mainColor:{
                        value:[1, 1, 1],
                        type:KICK.core.Constants.GL_FLOAT_VEC3
                    },
                    mainTexture:{
                        value:engine.resourceManager.getTexture("kickjs://texture/white/"),
                        type:KICK.core.Constants.GL_SAMPLER_2D
                    }
                }
            }),
            new KICK.material.Material(engine, {
                name:"Gray material",
                shader:engine.resourceManager.getShader("kickjs://shader/unlit/"),
                uniforms:{
                    mainColor:{
                        value:[1, 1, 1],
                        type:KICK.core.Constants.GL_FLOAT_VEC3
                    },
                    mainTexture:{
                        value:engine.resourceManager.getTexture("kickjs://texture/gray/"),
                        type:KICK.core.Constants.GL_SAMPLER_2D
                    }
                }
            })];

        // create meshes
        var meshes = ["kickjs://mesh/triangle/", "kickjs://mesh/cube/"];
        for (var i = 0; i < meshes.length; i++) {
            var gameObject = scene.createGameObject();
            gameObject.transform.position = [-2.0 + 4 * i, 0, 0];
            var meshRenderer = new KICK.scene.MeshRenderer();
            meshRenderer.mesh = engine.resourceManager.getMesh(meshes[i]);
            meshRenderer.material = materials[i];
            gameObject.addComponent(meshRenderer);
        }
    }

    this.decorateScene = function(scene){
        editorSceneCameraObject = scene.createGameObject();
        editorSceneCameraObject.name = "__editorSceneCameraObject__";
        editorSceneCameraObject.transform.position = [0,1,10];
        editorSceneCameraComponent = new KICK.scene.Camera({
            clearColor : [0.1,0.1,0.15,1.0],
            cameraIndex: Number.MAX_VALUE
        });
        editorSceneCameraObject.addComponent(editorSceneCameraComponent);
        editorSceneCameraObject.addComponent(new CameraNavigator(sceneEditorApp));

        editorSceneGridObject = scene.createGameObject();
        editorSceneGridObject.name = "__editorSceneGridObject__";
        editorSceneGridObject.addComponent(new VisualGrid());
    };
    Object.defineProperties(this,{
        engine:{
            get:function(){
                return engine;
            }
        }
    });
};

var SceneEditorApp = function(Y){
    var _view = new SceneEditorView(Y,this),
        _sceneGameObjects,
        _projectAssets,
        _propertyEditor,
        thisObj = this,
        deleteSelectedGameObject = function(){
            var uid = _sceneGameObjects.getSelectedGameObjectUid();
            if (!uid){
                return;
            }
            var gameObject = _view.engine.activeScene.getObjectByUID(uid);
            if (!gameObject){
                return;
            }
            gameObject.destroy();
            _sceneGameObjects.removeSelected();
        },
        createMaterial = function(){
            var material = new KICK.material.Material(engine, {
                shader:engine.resourceManager.getShader("kickjs://shader/unlit/"),
                uniforms:{
                    mainColor:{
                        value:[1, 1, 1],
                        type:KICK.core.Constants.GL_FLOAT_VEC3
                    },
                    mainTexture:{
                        value:engine.resourceManager.getTexture("kickjs://texture/white/"),
                        type:KICK.core.Constants.GL_SAMPLER_2D
                    }
                }
            });
            material.name = "Material #"+engine.getUID(material);
            _projectAssets.updateProjectContent();
            console.log("selecting "+material.uid);
            _projectAssets.selectProjectAsset(material.uid);
            _projectAssets.renameSelected();
        },
        createMeshRendererComponent = function(){
            var engine = _view.engine,
                project = engine.project,
                resourceManager = engine.resourceManager;
            var mesh = resourceManager.getMesh("kickjs://mesh/cube/");
            var materials = project.getResourceDescriptorByType("KICK.material.Material");
            if (materials.length>0){
                materials = [project.load(materials[0].uid)];
            } else {
                materials = [new KICK.material.Material(engine,{shader:resourceManager.getShader("kickjs://shader/__error/")})];
            }
            addComponent(KICK.scene.MeshRenderer,{mesh:mesh,materials:materials});
        };

    Object.defineProperties(this,{
        propertyEditor:{
            get:function(){
                return _propertyEditor;
            },
            set:function(v){
                _propertyEditor = v;
            }
        },
        sceneGameObjects:{
            get:function(){
                return _sceneGameObjects;
            },
            set:function(v){
                _sceneGameObjects = v;
            }
        },
        projectAssets:{
            get:function(){
                return _projectAssets;
            },
            set:function(v){
                _projectAssets = v;
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

    this.createDefaultScene = function(){
        var scene = _view.engine.activeScene;
        _view.decorateScene(scene);
        _view.createDefaultScene(scene);
    };
    this.projectAssetSelected = function(uid){
        _projectAssets.selectProjectAsset(uid);
        var resourceDescriptor = _view.engine.project.getResourceDescriptor(uid);
        _propertyEditor.setContent(resourceDescriptor);
        _sceneGameObjects.deselect();
    };

    this.gameObjectSelected = function(uid){
        _sceneGameObjects.selectGameObject(uid);
        var gameObject = _view.engine.activeScene.getObjectByUID(uid);
        _propertyEditor.setContent(gameObject);
        _projectAssets.deselect();
    };

    this.projectSave = function(responseFn, errorFn,isNew){
        var projectSave = Y.one("#projectSave");
        projectSave.setContent("Saving ...");
        var projectJSON = _view.engine.project.toJSON();
        var projectStr = JSON.stringify(projectJSON);
        var resetSaveButton = function(){
            projectSave.setContent('Save');
        };
        var respWrap = function(resp){
            if (responseFn){
                responseFn(resp);
            }
            projectSave.setContent("Save ok!");
            setTimeout(resetSaveButton,2000);
        };
        var errorWrap = function(resp){
            if (errorFn){
                errorFn(resp);
            }
            projectSave.setContent("Save error!");
            setTimeout(resetSaveButton,2000);
        };
        console.log("saving : "+projectStr );
        serverObject.resource.upload(projectName, 0, "application/json","project.json",projectStr,isNew,respWrap,errorWrap);
    };

    this.projectLoad = function(project){
        _view.engine.project.loadProject(project);
        _view.decorateScene(_view.engine.activeScene);
        _sceneGameObjects.updateSceneContent();
        _projectAssets.updateProjectContent();
    };

    this.projectRun = function(){
        console.log("Run");
        alert("Not implemented");
    };

    this.projectBuild = function(){
        console.log("Build");
        alert("Not implemented");
    };

    this.initEngine = function(){
        _view.engine.canvasResized();
    };

    var addComponent = function(componentType,config){
        var uid = _sceneGameObjects.getSelectedGameObjectUid();
        var gameObject = _view.engine.activeScene.getObjectByUID(uid);
        var component = new componentType(config || {});
        gameObject.addComponent(component);
        _propertyEditor.setContent(gameObject);
        hideSubMenues("#propertyPanelMenu");
    };

    var hideSubMenues = function(menuId){
        var menu = Y.one(menuId);
        menu.menuNav._hideAllSubmenus(menu);
    };

    Y.one("#projectSave").on("click",function(){thisObj.projectSave()});
    Y.one("#projectRun").on("click",function(){thisObj.projectRun()});
    Y.one("#projectBuild").on("click",function(){thisObj.projectBuild()});

    Y.one("#projectAddMaterial").on("click",createMaterial);
    Y.one("#projectAddShader").on("click",function(){alert("not implemented");});
    Y.one("#projectAddTexture").on("click",function(){alert("not implemented");});
    Y.one("#projectAddMesh").on("click",function(){alert("not implemented");});
    Y.one("#projectAddScene").on("click",function(){alert("not implemented");});
    Y.one("#projectAssetRename").on("click",function(){_projectAssets.renameSelected();});
    Y.one("#projectAssetDelete").on("click",function(){alert("not implemented");});
    Y.one("#gameObjectCreate").on("click",function(){_sceneGameObjects.createGameObject();});
    Y.one("#gameObjectRename").on("click",function(){_sceneGameObjects.renameSelected();});
    Y.one("#gameObjectDelete").on("click",deleteSelectedGameObject);

    Y.one("#componentAddMeshRenderer").on("click",createMeshRendererComponent);

    Y.one("#componentAddLightPoint").on("click",function(){addComponent(KICK.scene.Light,{type:KICK.core.Constants._LIGHT_TYPE_POINT});});
    Y.one("#componentAddLightDirectional").on("click",function(){addComponent(KICK.scene.Light,{type:KICK.core.Constants._LIGHT_TYPE_DIRECTIONAL});});
    Y.one("#componentAddLightAmbient").on("click",function(){addComponent(KICK.scene.Light,{type:KICK.core.Constants._LIGHT_TYPE_AMBIENT});});
    Y.one("#componentAddCamera").on("click",function(e){
        addComponent(KICK.scene.Camera);
    });

    var mainViewMenu = ["cameraWireframe","cameraShaded","cameraPerspective","cameraOrthographic","cameraSettings","cameraAlignSelected","cameraAlignCamera","cameraFrameSelected","cameraGrid","cameraGizmos"];
    for (var i=0;i<mainViewMenu.length;i++){
        Y.one("#"+mainViewMenu[i]).on("click",function(e){alert("Not implemented");});
    }
    // test
    Y.one("#cameraGrid").addClass("yui3-menu-label-selected");
};

function SceneGameObjects(Y,sceneEditorApp){
    var engine = sceneEditorApp.engine,
        sceneContentList = document.getElementById('sceneContentList'),
        thisObj = this,
        selectedTreeLeaf = null,
        selectGameObject = function(treeLeaf){
            if (selectedTreeLeaf){
                selectedTreeLeaf.get("boundingBox").removeClass("selected");
            }
            selectedTreeLeaf = treeLeaf;
            if (selectedTreeLeaf){
                selectedTreeLeaf.get("boundingBox").addClass("selected");
            }
        };

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
                if (name.indexOf('__') !== 0 || debug){
                    var treeNode = sceneTreeView.add({childType:"TreeLeaf",label:name});
                    treeNode.item(0).set("uid",uid);
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

    this.createGameObject = function(){
        var gameObject = engine.activeScene.createGameObject();
        var uid = gameObject.uid;
        var treeNodeContainer = sceneTreeView.add({childType:"TreeLeaf",label:"GameObject #"+uid});
        var treeNode = treeNodeContainer.item(0);
        treeNode.set("uid",uid);
        sceneEditorApp.gameObjectSelected(uid);
        thisObj.renameSelected();
    };

    this.renameSelected = function(){
        if (selectedTreeLeaf){
            var uid = selectedTreeLeaf.get("uid");
            var gameObject = engine.activeScene.getObjectByUID(uid);
            var name = gameObject.name || "GameObject #"+uid;
            var newValue = prompt("Enter GameObjects new name",name);
            if (newValue){
                gameObject.name = newValue;
                selectedTreeLeaf.get("contentBox").setContent(newValue);
                sceneEditorApp.gameObjectSelected(uid); // forces reload of property editor
            }
        }
    };

    /**
     * Deselect any gameObject
     * @method deselect
     */
    this.deselect = function(){
        selectGameObject(null);
    };

    this.selectGameObject = function(uid){
        for (i=sceneTreeView.size()-1;i>=0;i--){
            var element = sceneTreeView.item(i);
            if (parseInt(element.get("uid")) === uid){
                element.set("selected", 1); // full selected
                element.focus();
                selectGameObject(element);
                return;
            }
        }
    };

    this.removeSelected = function(){
        if (selectedTreeLeaf){
            sceneTreeView.remove(selectedTreeLeaf.get("index"));
            selectedTreeLeaf = null;
        }
    };

    /**
     * @method getSelectedGameObjectUid
     * @return selected uid or null
     */
    this.getSelectedGameObjectUid = function(){
        if (selectedTreeLeaf){
            return selectedTreeLeaf.get("uid");
        }
        return null;
    };

    sceneTreeView.on("treeleaf:click",function(e){
        selectGameObject(e.target);
        var uid = selectedTreeLeaf.get("uid");
        sceneEditorApp.gameObjectSelected(uid);
        e.preventDefault ();
    });

    this.updateSceneContent();
}

function ProjectAssets(Y, sceneEditorApp){
    var engine = sceneEditorApp.engine,
        selectedTreeLeaf = null,
        thisObj = this,
        projectTreeView = new Y.TreeView({
            srcNode: '#projectAssetList',
            contentBox: null,
            type: "TreeView",
            children: [
                {label:"test"}
            ]
        }),
        getAssetName = function (uid){
            var resourceDescriptor = engine.project.getResourceDescriptor(uid);
            var name = resourceDescriptor.name;
            if (!name){
                name = "Asset #"+resourceDescriptor.uid;
            }
            var type = resourceDescriptor.type;
            type = type.substring(type.lastIndexOf('.')+1);
            return name + " ("+type+")";
        };

    var selectProjectAsset = function(treeLeaf){
        if (selectedTreeLeaf){
            selectedTreeLeaf.get("boundingBox").removeClass("selected");
        }
        selectedTreeLeaf = treeLeaf;
        if (selectedTreeLeaf){
            selectedTreeLeaf.get("boundingBox").addClass("selected");
            var uid = selectedTreeLeaf.get("uid");
            sceneEditorApp.projectAssetSelected(uid);
        }
    };

    this.renameSelected = function(){
        if (selectedTreeLeaf){
            var uid = selectedTreeLeaf.get("uid");
            var asset = engine.project.load(uid);
            if (asset){
                var name = asset.name || "";
                var newName = prompt("Enter asset name", name);
                if (newName && newName.length>0 && newName.indexOf('__')!==0){
                    asset.name = newName;
                }
                engine.project.release(uid);
                selectedTreeLeaf.get("contentBox").setContent(getAssetName(uid));
            }
        }
    };

    /**
     * Deselect any gameObject
     * @method deselect
     */
    this.deselect = function(){
        selectProjectAsset(null);
    };

    projectTreeView.render();

    this.updateProjectContent = function(){
        var project = engine.project,
            activeProjectUidList = project.resourceDescriptorUIDs,
            activeProjectUids = {},
            treeValues = {},
            uid;

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
        for (uid in activeProjectUids){
            if (!treeValues[uid]){
                var name = getAssetName(uid);
                if (name.indexOf('__')!==0){
                    var treeNode = projectTreeView.add({childType:"TreeLeaf",label:name});
                    treeNode.item(0).set("uid",uid);
                }
            }
        }
        // delete uids not in scene
        for (uid in treeValues){
            if (!activeProjectUids[uid]){
                var node = treeValues[uid];
                projectTreeView.remove(node.get("index"));
            }
        }
    };

    this.selectProjectAsset = function(uid){
        for (i=projectTreeView.size()-1;i>=0;i--){
            var element = projectTreeView.item(i);
            if (parseInt(element.get("uid")) === uid){
                element.set("selected", 1); // full selected
                element.focus();
                selectProjectAsset(element);
                return;
            }
        }
    };

    this.updateProjectContent();

    projectTreeView.on("treeleaf:click",function(e){
        selectProjectAsset(e.target);
        e.preventDefault ();
    });
}

function TabView(Y,sceneEditorApp){
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

    // Since a canvas does not work well inside a TabView, it is added after the TabView and then hidden whenever the
    // selected index is not 0
    this.adjustView = function (){
        sceneView.style.display = "inline";
        sceneView.width = sceneView.clientWidth;
        sceneView.height = sceneView.clientHeight;
        sceneEditorApp.engine.canvasResized();
    };
    this.adjustView();

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
