"use strict";

/**
 * KickJS Editor
 * @module KICKED
 */
var getParameter = function(name){
    var pathName = location.pathname;
    pathName = pathName.substring(1);
    var splittedPathName = pathName.split("/");
    if (pathName.length == 0) {
        return null;
    }
    if (name === "useServer") {
        return splittedPathName[1] === "server";
    } else if (name === "project") {
        return decodeURIComponent(splittedPathName[2]);
    } else if (name === "debug") {
        return splittedPathName.length >=4 && splittedPathName[3] === "debug";
    }
    return null;
},
    /**
     * Global helper method to ensure valid asset / gameObject names
     */
    isNameValid = function(name){
        return name  && name.length>0 && name.indexOf('__')!==0;
    };

var serverObject = getParameter("useServer")? KICKED.server:KICKED.localStorage;
var projectName = getParameter("project");
var debug = getParameter("debug");

var sceneEditorApp;

YUI({
    gallery: 'gallery-2011.01.03-18-30'
}).use('tabview', 'escape', 'plugin', 'gallery-yui3treeview',"widget", "widget-position", "widget-stdmod", 'panel', 'node-menunav', 'handlebars', function(Y) {
        sceneEditorApp = new SceneEditorApp(Y);

        sceneEditorApp.initEngine();

        sceneEditorApp.tabView = new TabView(Y);

        sceneEditorApp.sceneGameObjects = new SceneGameObjects(Y);

        sceneEditorApp.projectAssets = new ProjectAssets(Y);

        sceneEditorApp.propertyEditor = new PropertyEditor(Y);

        // make engien public available (for debugging purpose)
        window.engine = sceneEditorApp.engine;

        var menus =["#sceneGameObjectMenu","#projectAssetMenu","#propertyPanelMenu","#mainViewMenu"];
        for (var i=0;i<menus.length;i++){
            var menu = Y.one(menus[i]);
            menu.plug(Y.Plugin.NodeMenuNav, {autoSubmenuDisplay:false});
        }

        sceneEditorApp.loadProject(projectName);
});

var DebugEditorScene = function(){
    var debugChildren = function(gameObjectParent,level){
        var components = "";
        var gameObjectToJSON = gameObjectParent.toJSON();
        for (var i=0;i<gameObjectToJSON .components.length;i++){
            components += gameObjectToJSON.components[i].type+";";
        }
        var indent = Array(level+2).join("  ");
        console.log(indent+gameObjectParent.name+" uid "+gameObjectParent.uid+" ("+gameObjectParent.proxyFor.uid+") ["+components+"]"); // write debug to log
        var transform = gameObjectParent.transform;
        var transformChildren = transform.children;
        level++;
        for (var i=transformChildren.length-1;i>=0;i--){
            debugChildren(transformChildren[i].gameObject, level);
        }
    };
    var engine = sceneEditorApp.view.engine;
    var activeScene = engine.activeScene;
    for (var i=activeScene.getNumberOfGameObjects()-1;i>=0;i--){
        var gameObject = activeScene.getGameObject(i);
        var transform = gameObject.transform;
        if (!transform.parent){ // if has no parent
            debugChildren(gameObject, 0);
        }
    }
    console.log("#gameObjects "+activeScene.getNumberOfGameObjects());
};


/**
 * SceneEditorApp
 * @class SceneEditorApp
 * @constructor
 * @param {YUI} Y
 */
var SceneEditorApp = function(Y){
    var _view = new window.SceneEditorView(Y,this),
        _sceneGameObjects,
        _projectAssets,
        _tabView,
        _propertyEditor,
        _currentSceneUID = 0,
        _currentSceneConfig,
        runWindow,
        thisObj = this,
        deleteSelectedGameObject = function(e){
            collapseMenu("#sceneGameObjectMenu");
            var uid = _sceneGameObjects.getSelectedGameObjectUid();
            if (!uid){
                return;
            }
            _view.deleteGameObject(uid);
            _sceneGameObjects.removeSelected();
            e.preventDefault ();
        },
        createMaterial = function(e){
            var engine = _view.engine,
                material = new KICK.material.Material(engine, {
                shader:engine.project.load(engine.project.ENGINE_SHADER_UNLIT),
                uniforms:{
                    mainColor:{
                        value:[1, 1, 1, 1],
                        type:KICK.core.Constants.GL_FLOAT_VEC3
                    },
                    mainTexture:{
                        value:engine.project.load(engine.project.ENGINE_TEXTURE_WHITE),
                        type:KICK.core.Constants.GL_SAMPLER_2D
                    }
                }
            });
            material.name = "Material #"+engine.getUID(material);
            _projectAssets.updateProjectContent();
            console.log("selecting "+material.uid);
            _projectAssets.selectProjectAssetById(material.uid);
            _projectAssets.renameSelected();
            e.preventDefault();
        },
        createMeshRendererComponent = function(e){
            var engine = _view.engine,
                project = engine.project;
            var mesh = project.load(project.ENGINE_MESH_CUBE);
            var materials = project.getResourceDescriptorsByType("KICK.material.Material");
            if (materials.length>0){
                materials = [project.load(materials[0].uid)];
            } else {
                materials = [new KICK.material.Material(engine,{shader:project.load(project.ENGINE_SHADER_ERROR) })];
            }
            _view.addComponent(_sceneGameObjects.getSelectedGameObjectUid(),KICK.scene.MeshRenderer,{mesh:mesh,materials:materials});
            collapseMenu("#propertyPanelMenu");
            e.preventDefault ();
        },
        setCurrentSceneUID = function(newValue){
            _currentSceneUID = newValue;
            _currentSceneConfig = _view.engine.project.getResourceDescriptor(newValue);
        },
        addScene = function(e){
            var engine = _view.engine;
            var sceneName = prompt("Create scene","Scene");
            if (isNameValid(sceneName)){
                var newScene = KICK.scene.Scene.createDefault(engine);
                newScene.name = sceneName;
                setCurrentSceneUID(_view.engine.getUID(newScene));
                _propertyEditor.setContent(null);
                _sceneGameObjects.updateSceneContent();
                _projectAssets.updateProjectContent();
                _projectAssets.selectProjectAssetById(newScene.uid);
                thisObj.tabView.updateSceneName(sceneName,newScene.uid);
            }
            e.preventDefault();
        },
        loadScene = function(uid){
            setCurrentSceneUID(uid);
            console.log("Active scene is now "+uid);
            _view.loadScene(_currentSceneConfig);
            _propertyEditor.setContent(null);
            _sceneGameObjects.updateSceneContent();
            thisObj.tabView.updateSceneName(_currentSceneConfig.name,_currentSceneConfig.uid);
        },
        panel = new Y.Panel({
            srcNode      : '#popupDialog',
            headerContent: 'Open/Create project',
            width        : 350,
            zIndex       : 5,
            centered     : true,
            modal        : true,
            visible      : false,
            render       : true
        }),
        uploadModel = function(e){
            var selectedFile = null,
                uploadButton,
                fileExt,
                doUpload = function(e){
                    if (!selectedFile){
                        return;
                    }
                    var uploadModelNormals = Y.one("#uploadModelNormals").get("checked"),
                        uploadModelNormalsRecalc = Y.one("#uploadModelNormalsRecalc").get("checked"),
                        uploadModelUV1 = Y.one("#uploadModelUV1").get("checked"),
                        uploadModelUV2 = Y.one("#uploadModelUV2").get("checked"),
                        uploadModelTangent = Y.one("#uploadModelTangent").get("checked"),
                        uploadModelTangentRecalc = Y.one("#uploadModelTangentRecalc").get("checked"),
                        uploadModelCreateGameObjects = Y.one("#uploadModelCreateGameObjects").get("checked"),
                        uploadModelCreateMaterials = Y.one("#uploadModelCreateMaterials").get("checked"),
                        uploadModelRotate90x = Y.one("#uploadModelRotate90x").get("checked");

                    var reader = new FileReader();
                    reader.onload = function(e) {
                        var fileAsString = e.target.result,
                            modelImport,
                            i;
                        if (fileExt === "dae"){
                            modelImport = KICK.importer.ColladaImporter;
                        } else if (fileExt === "obj"){
                            modelImport = KICK.importer.ObjImporter;
                        }
                        var importResult = modelImport.import(fileAsString,_view.engine,_view.engine.activeScene,uploadModelRotate90x);
                        for (i = 0;i<importResult.mesh.length;i++){
                            var mesh = importResult.mesh[i];
                            (function(mesh){
                                var meshData = mesh.meshData;
                                if (!uploadModelNormals){
                                    meshData.normal = null;
                                }
                                if (uploadModelNormalsRecalc ||
                                    (uploadModelNormals && !meshData.normal)){ // recompute if not exist
                                    meshData.recalculateNormals();
                                }
                                if (!uploadModelUV1){
                                    meshData.uv1 = null;
                                }
                                if (!uploadModelUV2){
                                    meshData.uv2 = null;
                                }
                                if (!uploadModelTangent){
                                    meshData.tangent = null;
                                }
                                if (uploadModelTangentRecalc ||
                                    (uploadModelTangent && !meshData.tangent)){ // recompute if not exists
                                    meshData.recalculateTangents();
                                }
                                mesh.meshData = meshData; // update mesh

                                var meshDataSerialized = meshData.serialize();
                                var onSuccess = function(resp){
                                    mesh.setDataURI(resp.response.dataURI);
                                    console.log("Data data URI to "+resp.response.dataURI);
                                };
                                var onError = function(resp){
                                    console.log("onError",resp);
                                };
                                serverObject.resource.upload(projectName,mesh.uid,"mesh/kickjs",mesh.name,meshDataSerialized,onSuccess,onError);
                            })(mesh);
                        }

                        for (i=0;i<importResult.gameObjects.length;i++){
                            var newGameObject = importResult.gameObjects[i];
                            if (!uploadModelCreateGameObjects){
                                newGameObject.destroy();
                            } else {
                                _view.createGameObject(newGameObject.name,newGameObject);
                                for (var j=0;j<newGameObject.numberOfComponents;j++){
                                    var component = newGameObject.getComponent(j);
                                    if (component instanceof KICK.scene.MeshRenderer){
                                        _view.addExistingComponent(component);
                                    } else if (! (component instanceof KICK.scene.Transform)){
                                        KICK.core.Util.warn("Unknown type of component : "+component);
                                        console.log(component);
                                    }
                                }
                            }
                        }

                        _sceneGameObjects.updateSceneContent();
                        _projectAssets.updateProjectContent();
                        panel.hide();
                    };
                    reader.onerror = function(e){
                        alert("Error loading file");
                        panel.hide();
                    };
                    reader.readAsText(selectedFile);
                    e.preventDefault();
                };
            collapseMenu("#projectAssetMenu");
            panel.set("headerContent", "Model upload");
            panel.setStdModContent(Y.WidgetStdMod.BODY, Y.one("#modelUploadForm").getDOMNode().innerHTML);
            panel.set("buttons", []);
            panel.addButton({
                value  : 'Cancel',
                section: Y.WidgetStdMod.FOOTER,
                action : function (e) {
                    panel.hide();
                    e.preventDefault ();
                }
            });
            panel.addButton({
                value  : 'Upload',
                classNames: ['disabledButton'],
                section: Y.WidgetStdMod.FOOTER,
                action : doUpload
            });
            panel.render();

            uploadButton = panel._buttonsArray[1].node;
            Y.one("#uploadModelFile").on("change",function(e){
                selectedFile = null;
                if (e._event.target.files.length){
                    selectedFile = e._event.target.files[0];
                    fileExt = selectedFile.name.toLowerCase().split(".");
                    fileExt = fileExt[fileExt.length-1];
                    if (fileExt === "dae" || fileExt === "obj"){
                        uploadButton.removeClass('disabledButton');
                        Y.one("#uploadModelErrorMsg").setContent("&nbsp;");

                    } else {
                        uploadButton.addClass('disabledButton');
                        selectedFile = null;
                        Y.one("#uploadModelErrorMsg").setContent("Only Collada (.dae) and Wavefront (.obj) files supported");
                    }
                } else {
                    uploadButton.addClass('disabledButton');
                }
            });

            panel.show();
            e.preventDefault();
        },
        uploadImage = function(e){
            var selectedFile = null,
                uploadButton,
                fileName,
                fileExt,
                doUploadImage = function(e){
                    if (!selectedFile){
                        return;
                    }

                    var reader = new FileReader();
                    reader.onload = function(e) {
                        var fileAsArrayBuffer = e.target.result;
                        var texture = new KICK.texture.Texture(engine,{name:fileName});
                        var onSuccess = function(resp){
                            var imageUrl = resp.response.dataURI;
                            reader.onload = function(e){
                                var img = new Image();
                                img.onload = function(){
                                    texture.setImage(img, imageUrl);
                                };
                                img.src = e.target.result;

                            };
                            reader.readAsDataURL(selectedFile);

                        };
                        var onError = function(resp){
                            console.log("onError",resp);
                        };
                        serverObject.resource.upload(projectName,texture.uid,"image/kickjs",texture.name,fileAsArrayBuffer,onSuccess,onError);
                        _sceneGameObjects.updateSceneContent();
                        _projectAssets.updateProjectContent();
                        panel.hide();
                    };
                    reader.onerror = function(e){
                        alert("Error loading file");
                        panel.hide();
                    };
                    reader.readAsArrayBuffer(selectedFile);

                };
            collapseMenu("#projectAssetMenu");
            panel.set("headerContent", "Image upload");
            panel.setStdModContent(Y.WidgetStdMod.BODY, Y.one("#imageUploadForm").getDOMNode().innerHTML);
            panel.set("buttons", []);
            panel.addButton({
                value  : 'Cancel',
                section: Y.WidgetStdMod.FOOTER,
                action : function (e) {
                    panel.hide();
                }
            });
            panel.addButton({
                value  : 'Upload',
                classNames: ['disabledButton'],
                section: Y.WidgetStdMod.FOOTER,
                action : doUploadImage
            });
            panel.render();

            uploadButton = panel._buttonsArray[1].node;
            Y.one("#uploadImageFile").on("change",function(e){
                selectedFile = null;
                if (e._event.target.files.length){
                    selectedFile = e._event.target.files[0];
                    var selectedFilename = selectedFile.name;
                    fileExt = selectedFilename.toLowerCase().split(".");
                    fileName = selectedFilename.substr(0,selectedFilename.length-fileExt.length-2);
                    fileExt = fileExt[fileExt.length-1];
                    if (fileExt === "jpeg" || fileExt === "png" || fileExt === "jpg"){
                        uploadButton.removeClass('disabledButton');
                        Y.one("#uploadImageErrorMsg").setContent("&nbsp;");

                    } else {
                        uploadButton.addClass('disabledButton');
                        selectedFile = null;
                        Y.one("#uploadImageErrorMsg").setContent("Only png and jpeg file formats are supported");
                    }
                } else {
                    uploadButton.addClass('disabledButton');
                }
            });
            panel.show();
            e.preventDefault();
        },
        hasLightOfType = function (type){
            var lights = _view.engine.activeScene.findComponentsOfType(KICK.scene.Light);
            for (var i=0;i<lights.length;i++){
                if (lights[i].type === type){
                    return true;
                }
            }
            return false;
        };

    /**
     * @method loadProject
     * @param {String} projectName
     */
    this.loadProject = function(projectName){
        var onError = function(errorObj){
            alert("Error loading project");
            console.log(errorObj);
        };

        var onResourceLoadSuccess = function(content, isSceneNotFound){
            var sceneReady = function(){
                Y.one("#loadingPanel").addClass("hiddenContent");
                Y.one("#layout").removeClass("hiddenContent");
                _tabView.adjustView();
            };
            if (isSceneNotFound){
                thisObj.projectLoad(window.kickjsDefaultProject, function(){
                    thisObj.saveProject(sceneReady,onError,true);
                    sceneReady();
                });
            } else {
                thisObj.projectLoad(content,sceneReady);
            }
        };
        var onResourceLoadError = function(content, isError){
            onResourceLoadSuccess(null,true);
        };
        var onProjectLoad = function(resp){
            serverObject.resource.load(projectName, 0,onResourceLoadSuccess, onResourceLoadError,true);
        };

        serverObject.project.load(projectName, onProjectLoad, onError);
        Y.one("#projectTitel").setContent(projectName);
    };

    /**
     * @method deleteProject
     */
    this.deleteProject = function(){
        panel.set("headerContent", "Delete project");
        panel.setStdModContent(Y.WidgetStdMod.BODY, "Delete project permanently?");
        panel.set("buttons", []);
        panel.addButton({
            value  : 'Cancel',
            section: Y.WidgetStdMod.FOOTER,
            action : function (e) {
                panel.hide();
                e.preventDefault ();
            }
        });
        panel.addButton({
            value  : 'Delete',
            section: Y.WidgetStdMod.FOOTER,
            classNames: ['deleteButton'],
            action : function(e){
                var onSuccess = function(){
                    location = location.origin;
                };
                var onError = function(err){
                    console.log(err);
                    Y.one("#loadingPanel").addClass("hiddenContent");
                    Y.one("#layout").removeClass("hiddenContent");
                    alert("Error deleting project: "+err);
                };
                Y.one("#loadingPanel").removeClass("hiddenContent");
                Y.one("#layout").addClass("hiddenContent");
                serverObject.project.delete(projectName,onSuccess,onError);
                panel.hide();
                e.preventDefault ();
            }
        });
        panel.render();
        panel.show();
    };

    Object.defineProperties(this,{
        /**
         * Readonly
         * @property currentSceneUID
         * @type Number
         */
        currentSceneUID:{
            get:function(){
                return _currentSceneUID;
            }
        },
        /**
         * Readonly
         * @property currentSceneConfig
         * @type Object
         */
        currentSceneConfig:{
            get:function(){
                return _currentSceneConfig;
            }
        },
        /**
         * @property tabView
         * @type TabView
         */
        tabView:{
            get:function(){
                return _tabView;
            },
            set:function(newValue){
                _tabView = newValue;
            }
        },
        /**
         * @property propertyEditor
         * @type PropertyEditor
         */
        propertyEditor:{
            get:function(){
                return _propertyEditor;
            },
            set:function(v){
                _propertyEditor = v;
            }
        },
        /**
         * @property sceneGameObjects
         * @type SceneGameObjects
         */
        sceneGameObjects:{
            get:function(){
                return _sceneGameObjects;
            },
            set:function(v){
                _sceneGameObjects = v;
            }
        },
        /**
         * @property projectAssets
         * @type ProjectAssets
         */
        projectAssets:{
            get:function(){
                return _projectAssets;
            },
            set:function(v){
                _projectAssets = v;
            }
        },
        /**
         * @property view
         * @type SceneEditorView
         */
        view:{
            get:function(){
                return _view;
            }
        },
        /**
         * @property Engine
         * @type KICK.core.Engine
         */
        engine:{
            get:function(){
                return _view.engine;
            }
        }
    });

    /**
     * @method projectAssetSelected
     * @param {Number} uid
     */
    this.projectAssetSelected = function(uid){
        _projectAssets.selectProjectAssetById(uid);
        var resourceDescriptor = _view.engine.project.getResourceDescriptor(uid);
        if (!resourceDescriptor){
            _propertyEditor.setContent(null);
        } else if (resourceDescriptor.type === "KICK.scene.Scene"){
            loadScene(uid);
        } else {
            _propertyEditor.setContent(resourceDescriptor);
        }
        _sceneGameObjects.deselect();
    };

    /**
     * @method gameObjectSelected
     * @param {Number} uid
     */
    this.gameObjectSelected = function(uid){
        _sceneGameObjects.selectGameObject(uid);
        // var gameObject = _view.engine.activeScene.getObjectByUID(uid);
        var gameObjects = _currentSceneConfig.config.gameObjects;
        var gameObject;
        for (var i = gameObjects.length-1;i>=0;i--){
            if (gameObjects[i].uid == uid){
                gameObject = gameObjects[i];
                break;
            }
        }

        _propertyEditor.setContent(gameObject,true);
        _projectAssets.deselect();
    };

    /**
     * @method saveProject
     * @param {Function} responseFn
     * @param {Function} errorFn
     */
    this.saveProject = function(responseFn, errorFn){
        var projectSave = Y.one("#projectSave");
        projectSave.setContent("Saving ...");
        _view.saveScene(_currentSceneUID);
        var projectJSON = _view.engine.project.toJSON();
        projectJSON.activeScene = _currentSceneUID; // replace with wrapping scene
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
        serverObject.resource.upload(projectName, 0, "application/json","project.json",projectStr,respWrap,errorWrap);
    };

    /**
     * @method projectLoad
     * @param {Object} projectConfig
     */
    this.projectLoad = function(projectConfig, onSuccess){
        _view.loadProject(projectConfig, function(){
            loadScene(projectConfig.activeScene);
            _sceneGameObjects.updateSceneContent();
            _projectAssets.updateProjectContent();
            onSuccess();
        });


    };

    /**
     * @method projectRun
     */
    this.projectRun = function(){
        var project = engine.project,
                    projectSettings = project.getResourceDescriptorsByType('ProjectSettings')[0].config;
        var postMessage = {
            action: "loadProject",
            useServer: getParameter("useServer"),
            projectSettings: projectSettings,
            projectName: projectName,
            projectConfig: _view.engine.project.toJSON(ProjectBuild.buildProjectFilter)
        };
        postMessage = JSON.stringify(postMessage);
        if (runWindow && !runWindow.closed){
            runWindow.focus();
            runWindow.postMessage(postMessage,"*");
        } else {
            var windowUrl = debug?"/run-debug.html":"/run.html";
            var windowName = "KickJS Run Project";
            var windowFeatures = "width="+(projectSettings.canvasWidth)+",height="+(projectSettings.canvasHeight)+",scrollbars=no,location=no,personalbar=no";
            runWindow = window.open(windowUrl,windowName,windowFeatures);
            runWindow.msg = postMessage;
        }
    };

    /**
     * @method initEngine
     */
    this.initEngine = function(){
        _view.engine.canvasResized();
    };


    /**
     * @method reloadSelected
     */
    this.reloadSelected = function(){
        var gameObjectUid = _sceneGameObjects.getSelectedGameObjectUid();
        thisObj.gameObjectSelected(gameObjectUid);
    };

    /**
     * @method collapseMenu
     * @param menuId
     * @private
     */
    var collapseMenu = function(menuId){
        var menu = Y.one(menuId);
        menu.menuNav._hideAllSubmenus(menu);
    };

    Y.one("#projectSave").on("click",function(e){
        thisObj.saveProject();
        e.preventDefault ();
    });
    Y.one("#projectRun").on("click",function(e){
        thisObj.projectRun();
        e.preventDefault ();
    });
    Y.one("#projectBuild").on("click",function(e){
        var projectBuild = new ProjectBuild(Y,_view.engine,panel);
        projectBuild.projectBuild();
        e.preventDefault ();
    });

    Y.one("#projectAddMaterial").on("click",createMaterial);
    Y.one("#projectAddShader").on("click",function(e){
        alert("not implemented");
        e.preventDefault ();
    });
    Y.one("#projectAddTexture").on("click",uploadImage);
    Y.one("#projectUploadModel").on("click",uploadModel);
    Y.one("#projectAddScene").on("click",addScene);
    Y.one("#projectAssetRename").on("click",function(e){
            collapseMenu("#projectAssetMenu");
            _projectAssets.renameSelected();
            e.preventDefault ();
        }
    );
    Y.one("#projectAssetDelete").on("click",function(e){
        collapseMenu("#projectAssetMenu");
        _projectAssets.deleteSelected();
        e.preventDefault ();
    });
    if (debug){
        Y.one("#projectAssetRefresh").on("click",function(e){
            _projectAssets.updateProjectContent();
            e.preventDefault ();
        });
    } else {
        Y.one("#projectAssetRefresh").remove(true);
    }

    Y.one("#gameObjectCreate").on("click",function(e){
        _sceneGameObjects.createGameObject();
        e.preventDefault ();
    });
    Y.one("#gameObjectRename").on("click",function(e){
        collapseMenu("#sceneGameObjectMenu");
        _sceneGameObjects.renameSelected();
        e.preventDefault ();
    });
    Y.one("#gameObjectDelete").on("click",deleteSelectedGameObject);
    if (debug){
        Y.one("#gameObjectRefresh").on("click",function(e){
            _sceneGameObjects.updateSceneContent();
            e.preventDefault();
        });
    } else {
        Y.one("#gameObjectRefresh").remove(true);
    }
    Y.one("#componentAddMeshRenderer").on("click",createMeshRendererComponent);

    Y.one("#componentAddLightPoint").on("click",function(e){
        collapseMenu("#propertyPanelMenu");
        _view.addComponent(_sceneGameObjects.getSelectedGameObjectUid(),KICK.scene.Light,{type:KICK.core.Constants._LIGHT_TYPE_POINT});
        e.preventDefault ();
    });
    Y.one("#componentAddLightDirectional").on("click",function(e){
        collapseMenu("#propertyPanelMenu");
        if (hasLightOfType(KICK.core.Constants._LIGHT_TYPE_DIRECTIONAL)){
            alert("The scene already contains a directional light");
        } else {
            _view.addComponent(_sceneGameObjects.getSelectedGameObjectUid(),KICK.scene.Light,{type:KICK.core.Constants._LIGHT_TYPE_DIRECTIONAL});
        }
        e.preventDefault ();
    });
    Y.one("#componentAddLightAmbient").on("click",function(e){
        collapseMenu("#propertyPanelMenu");
        if (hasLightOfType(KICK.core.Constants._LIGHT_TYPE_AMBIENT)){
            alert("The scene already contains an ambient light");
        } else {
            _view.addComponent(_sceneGameObjects.getSelectedGameObjectUid(),KICK.scene.Light,
                {
                    type:KICK.core.Constants._LIGHT_TYPE_AMBIENT,
                    intensity:0.3
                });
        }
        e.preventDefault ();
    });
    Y.one("#componentAddCamera").on("click",function(e){
        collapseMenu("#propertyPanelMenu");
        _view.addComponent(_sceneGameObjects.getSelectedGameObjectUid(),KICK.scene.Camera);
        e.preventDefault ();
    });
    Y.one("#cameraGrid").on("click",function(e){
        collapseMenu("#mainViewMenu");
        sceneEditorApp.view.gridEnabled = !sceneEditorApp.view.gridEnabled;
        e.preventDefault ();
    });

    var mainViewMenu = ["cameraWireframe","cameraShaded","cameraPerspective","cameraOrthographic","cameraSettings","cameraAlignSelected","cameraAlignCamera","cameraFrameSelected","cameraGizmos"];
    for (var i=0;i<mainViewMenu.length;i++){
        Y.one("#"+mainViewMenu[i]).on("click",function(e){
            alert("Not implemented");
            e.preventDefault ();
        });
    }
};

/**
 * SceneGameObjects
 * @class SceneGameObjects
 * @constructor
 * @param {YUI} Y
 */
function SceneGameObjects(Y){
    var engine = sceneEditorApp.engine,
        labelTemplate = Y.Handlebars.compile('<span title="{{title}}">{{label}}</span>'),
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

    /**
     * @method updateSceneContent
     */
    this.updateSceneContent = function(){
        var treeValues = {},
            activeSceneUids = {},
            // activeScene,
            sceneConfig,
            i;

        // save used elements to treeValues
        for (i=sceneTreeView.size()-1;i>=0;i--){
            var element = sceneTreeView.item(i);
            treeValues[element.get("uid")] = element;
        }

        var selectecSceneUid = sceneEditorApp.currentSceneUID;
        sceneConfig = engine.project.getResourceDescriptor(selectecSceneUid).config;
        if (sceneConfig.name.indexOf("__")==0){
            console.log("invalid scene");
            debugger;
        }


        // save all uid to activeSceneUids
        for (i=sceneConfig.gameObjects.length - 1;i>=0;i--){
            var gameObject = sceneConfig.gameObjects[i];
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
                    var treeNode = sceneTreeView.add({childType:"TreeLeaf",label:labelTemplate({label:name,title:"UID: "+gameObject.uid})});
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
    /**
     * @method createGameObject
     */
    this.createGameObject = function(){
        var newName = prompt("Enter GameObjects name","GameObject");
        if (isNameValid(newName)){
            var gameObject = sceneEditorApp.view.createGameObject(newName);
            var uid = gameObject.uid;
            var treeNodeContainer = sceneTreeView.add({childType:"TreeLeaf",label:labelTemplate({label:newName,title:"UID: "+uid})});
            var treeNode = treeNodeContainer.item(0);
            treeNode.set("uid",uid);
            sceneEditorApp.gameObjectSelected(uid);
        }
    };

    /**
     * @method renameSelected
     */
    this.renameSelected = function(){
        if (selectedTreeLeaf){
            var uid = selectedTreeLeaf.get("uid");
            var gameObject = sceneEditorApp.view.lookupSceneObjectBasedOnOriginalUID(uid);
            var name = gameObject.name || "GameObject #"+uid;
            var newName = prompt("Enter GameObjects new name",name);
            if (newName){
                sceneEditorApp.view.renameGameObject(uid,newName);
                selectedTreeLeaf.get("contentBox").setContent(labelTemplate({label:newName,title:"UID: "+uid}));
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

    /**
     * @method selectGameObject
     * @param {Number} uid
     */
    this.selectGameObject = function(uid){
        for (var i=sceneTreeView.size()-1;i>=0;i--){
            var element = sceneTreeView.item(i);
            if (parseInt(element.get("uid")) === uid){
                element.set("selected", 1); // full selected
                element.focus();
                selectGameObject(element);
                return;
            }
        }
    };

    /**
     * @method removeSelected
     */
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
}

/**
 * ProjectAssets
 * @class ProjectAssets
 * @constructor
 * @param {YUI} Y
 */
function ProjectAssets(Y){
    var engine = sceneEditorApp.engine,
        selectedTreeLeaf = null,
        thisObj = this,
        labelTemplate = Y.Handlebars.compile('<span title="{{title}}">{{label}}</span>'),
        projectTreeView = new Y.TreeView({
            srcNode: '#projectAssetList',
            contentBox: null,
            type: "TreeView",
            children: [
            ]
        }),
        getAssetDescription = function (uid){
            var resourceDescriptor = engine.project.getResourceDescriptor(uid);
            var name = resourceDescriptor.name;
            if (!name){
                name = "Asset #"+resourceDescriptor.uid;
            }
            var type = resourceDescriptor.type;
            type = type.substring(type.lastIndexOf('.')+1);
            var title = type+" \nUID: "+resourceDescriptor.uid;
            return {
                label:name,
                title: title
            };
        };

    /**
     * Invoken when an asset is selected in the tree menu
     * @method selectProjectAsset
     * @param treeLeaf
     * @private
     */
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

    /**
     * @method deleteSelected
     */
    this.deleteSelected = function(){
        if (selectedTreeLeaf){
            var uid = parseInt(selectedTreeLeaf.get("uid"));
            engine.project.removeResourceDescriptor(uid);
            this.updateProjectContent();
            sceneEditorApp.projectAssetSelected(0);
        }
    };

    /**
     * @method renameSelected
     * @param {Function} afterRenameFn
     */
    this.renameSelected = function(afterRenameFn){
        if (selectedTreeLeaf){
            var uid = selectedTreeLeaf.get("uid");
            var asset = engine.project.load(uid);
            if (asset){
                var name = asset.name || "";
                var newName = prompt("Enter asset name", name);
                if (isNameValid(newName)){
                    asset.name = newName;
                    if (afterRenameFn){
                        afterRenameFn();
                    }
                    if (asset instanceof KICK.scene.Scene){
                        sceneEditorApp.tabView.updateSceneName(newName,uid);
                    }
                    selectedTreeLeaf.get("contentBox").setContent(labelTemplate(getAssetDescription(uid)));
                }
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

    /**
     * @method updateProjectContent
     */
    this.updateProjectContent = function(){
        var project = engine.project,
            activeProjectUidList = project.resourceDescriptorUIDs,
            activeProjectUids = {},
            treeValues = {},
            uid,
            i;

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
                var assetDescription = getAssetDescription(uid);
                if ((assetDescription.label.indexOf('__')!==0 && uid > 0)|| debug){
                    var treeNode = projectTreeView.add({childType:"TreeLeaf",label:labelTemplate(assetDescription)});
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

    /**
     * @method selectProjectAssetById
     * @param {Number} uid
     */
    this.selectProjectAssetById = function(uid){
        for (var i=projectTreeView.size()-1;i>=0;i--){
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

/**
 * TabView
 * @class TabView
 * @constructor
 * @param {YUI} Y
 */
function TabView(Y){
    var thisObj = this,
        Removeable = function(config) {
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
        }
        ],
        plugins: [Removeable]
    });
    tabview.render();

    /**
     * @method updateSceneName
     * @param {String} sceneName
     * @param {Number} uid
     */
    this.updateSceneName = function(sceneName,uid){
        tabview.item(0).set("label", sceneName);
        tabview.item(0).set("uid", uid);
    };

    /**
     * @method selectTabByUID
     * @param {Number} uid
     */
    this.selectTabByUID = function(uid){
        for (var i = 0;i<tabview.size();i++){
            if (tabview.get("uid") == uid){
                tabview.selectChild(i);
                break;
            }
        }
    };



    // Since a canvas does not work well inside a TabView, it is added after the TabView and then hidden whenever the
    // selected index is not 0
    /**
     * @method adjustView
     */
    this.adjustView = function (){
        var sceneView = document.getElementById('sceneView');
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
                thisObj.adjustView();
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

window.addEventListener('message',function(event) {
    if(event.origin !== location.origin) return;
    KICK.onMessage(event.data);
},false);
