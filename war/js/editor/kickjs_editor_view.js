
/**
 * SceneEditorView
 * @class SceneEditorView
 * @constructor
 * @param {YUI} Y
 */
var SceneEditorView = function(Y){
    var canvas = Y.one("#sceneView"),
        engine = new KICK.core.Engine('sceneView',
        {
            enableDebugContext: debug
        }),
        thisObj = this,
        cameraObject,
        // the camera object in the scene
        cameraComponent,
        // the grid component in the scene
        gridObject,
        gridComponent,
        // parent for actual objects in the scene
        sceneRootObject,
        // parent for transform components
        transformComponentObject,
        originalUidToNewUidMap = {},
        destroyAllChildComponent = function(parentGameObject, destroyThis){
            var transform = parentGameObject.transform;
            var children = transform.children;
            for (var i=0;i<children.length;i++){
                destroyAllChildComponent(children[i].gameObject,true);
            }
            if (destroyThis){
                parentGameObject.destroy();
            }
        },
        /**
         * Decorate the editor scene with the following gameobject structure:<br>
         * __editorSceneRoot__ : placeholder for scene objects
         * __editorSceneCameraObject__ : External scene camera
         * __editorSceneGridObject__ : Grid object
         * __editorSceneTransformComponent__ : parent object for transform objects
         * @method decorateScene
         * @param {KICK.scene.Scene} scene
         * @private
         */
        decorateScene = function(scene){
            var sceneRootName = "__editorSceneRoot__";
            sceneRootObject = scene.getGameObjectByName(sceneRootName);
            if (!sceneRootObject){
                sceneRootObject = scene.createGameObject({name:sceneRootName});
                console.log("Created "+sceneRootObject.name);
            }
            var cameraName = "__editorSceneCameraObject__";
            cameraObject = scene.getGameObjectByName(cameraName);
            if (!cameraObject){
                cameraObject = scene.createGameObject({name: cameraName});

                cameraObject.transform.position = [0,1,10];
                cameraComponent = new KICK.scene.Camera({
                    clearColor : [0.1,0.1,0.15,1.0]
                });
                cameraObject.addComponent(cameraComponent);
                cameraObject.addComponent(new CameraNavigator());
            } else {
                cameraComponent = cameraObject.getComponentOfType(KICK.scene.Camera);
            }
            var gridName = "__editorSceneGridObject__";
            gridObject = scene.getGameObjectByName(gridName);
            if (!gridObject){
                gridObject = scene.createGameObject({name:gridName});
                gridComponent = new VisualGrid();
                gridObject.addComponent(gridComponent);
            } else {
                gridComponent = gridObject.getComponentOfType(VisualGrid);
            }
            var transformCompName = "__editorSceneTransformComponent__";
            transformComponentObject = scene.getGameObjectByName(transformCompName);
            if (!transformComponentObject){
                transformComponentObject = scene.createGameObject({name:transformCompName});
            }
        },
        getEditorScene = function(){
            var editorSceneName = "__editorScene__";
            // delete current editor scenes (if any)
            var currentResources = engine.project.getResourceDescriptorsByName(editorSceneName);
            for (var i=0;i<currentResources.length;i++){
                engine.project.removeResourceDescriptor(currentResources[i].uid);
            }
            // create new editorscene
            editorScene = new KICK.scene.Scene(engine, {name:editorSceneName});
            decorateScene(editorScene);
            return editorScene;
        },
        editorScene,
        // a reference to the current scene
        currentSceneConfig;

        Y.one("window").on("resize", function(){
            canvas.set("width",canvas.get("clientWidth"));
            canvas.set("height",canvas.get("clientHeight"));
            engine.canvasResized();
        });

    engine.resourceManager.addResourceProvider(new KICKED.LocalStorageResourceProvider(engine));

    /**
     * @method createGameObject
     * @param {String} name
     * @return KICK.scene.GameObject
     */
    this.createGameObject = function(name){
        var gameObject = engine.activeScene.createGameObject({name:name});
        originalUidToNewUidMap[gameObject.uid] = gameObject.uid; // this maps gameObject to itself
        var transformUid = engine.getUID(gameObject.transform);
        originalUidToNewUidMap[transformUid] = transformUid; // this maps transform to itself
        var gameObjectJSON = gameObject.toJSON();
        currentSceneConfig.gameObjects.push(gameObjectJSON);
        gameObject.proxyFor = gameObjectJSON;
        gameObject.transform.proxyFor = gameObjectJSON.components[0];
        return gameObject;
    };


    /**
     * @method saveScene
     * @param currentSceneUID
     */
    this.saveScene = function(currentSceneUID){
        var resourceDescriptor = engine.project.getResourceDescriptor(currentSceneUID);
        resourceDescriptor.updateConfig(currentSceneConfig);
    };

    /**
     * @method renameGameObject
     * @param {Number} uid
     * @param {String} name
     */
    this.renameGameObject = function(uid, name){
        var gameObject = thisObj.lookupSceneObjectBasedOnOriginalUID(uid);
        gameObject.name = name;
        gameObject.proxyFor.name = name;
    };

    this.deleteComponent = function(uid){
        uid = parseInt(uid);
        var component = thisObj.lookupSceneObjectBasedOnOriginalUID(uid),
            gameObject,
            configurationComponents,
            i,
            gameObjectUid;
        if (component){
            gameObject = component.gameObject;
            configurationComponents = gameObject.proxyFor.components;
            gameObjectUid = gameObject.uid;
        } else {
            // manually search for component based on uid
            for (i = 0;i<currentSceneConfig.gameObjects.length;i++){
                var gameObjectConfig = currentSceneConfig.gameObjects[i];
                for (var j=0;j<gameObjectConfig.components.length;j++){
                    var componentUid = gameObjectConfig.components[j].uid;
                    if (componentUid === uid){
                        configurationComponents = gameObjectConfig.components;
                        gameObjectUid = gameObjectConfig.uid;
                    }
                }
            }
        }
        // remove component on configuration
        for (i = 0;i<configurationComponents.length;i++){
            if (configurationComponents[i].uid === uid){
                configurationComponents.splice(i,1); // remove element from array
                delete originalUidToNewUidMap[uid]; // delete reference
                if (component){
                    gameObject.removeComponent(component); // remove scene component from scene object if exist
                }
                break;
            }
        }

        // reload game object
        sceneEditorApp.gameObjectSelected(gameObjectUid);
    };

    /**
     * @method deleteGameObject
     * @param {Number} uid
     */
    this.deleteGameObject = function(uid){
        uid = parseInt(uid);
        var gameObject = thisObj.lookupSceneObjectBasedOnOriginalUID(uid);
        for (var i = 0;i<currentSceneConfig.gameObjects.length;i++){
            var gameObjectConfig = currentSceneConfig.gameObjects[i];
            if (gameObjectConfig.uid === uid){
                // clean up references to object in originalUidToNewUidMap
                delete originalUidToNewUidMap[uid];
                for (var j=0;j<gameObjectConfig.components.length;j++){
                    var componentUid = gameObjectConfig.components[j].uid;
                    delete originalUidToNewUidMap[componentUid];
                }
                // remove gameobject from array
                currentSceneConfig.gameObjects.splice(i, 1);
                break;
            }
        }
        // remove gameObject from scene
        gameObject.destroy();
    };

    /**
     * @method lookupSceneObjectBasedOnOriginalUID
     * @param {Number} uid
     * @return {GameObject|Component}
     */
    this.lookupSceneObjectBasedOnOriginalUID = function(uid){
        var originalUid = originalUidToNewUidMap[uid];
        return engine.activeScene.getObjectByUID(originalUid);
    };

    /**
     * @method addComponent
     * @param {Function} componentType
     * @param {Object} config
     * @private
     */
    this.addComponent = function(uid,componentType,config){
        if (uid){
            var gameObject = thisObj.lookupSceneObjectBasedOnOriginalUID (uid);
            var component = new componentType(config || {});
            var componentUid = engine.getUID(component);
            originalUidToNewUidMap[componentUid] = componentUid;
            gameObject.addComponent(component);
            var jsonObject = component.toJSON();
            component.proxyFor = jsonObject;
            gameObject.proxyFor.components.push(jsonObject);
            sceneEditorApp.gameObjectSelected(gameObject.uid);
        }
    };

    /**
     * @method loadScene
     * @param {KICK.core.ResourceDescriptor} sceneResourceDescr
     */
    this.loadScene = function(sceneResourceDescr){
        destroyAllChildComponent(sceneRootObject);
        originalUidToNewUidMap = {};
        currentSceneConfig = sceneResourceDescr.config;
        var gameObjects = currentSceneConfig.gameObjects,
            newComponents = [],
            componentsConfigs = [],
            applyConfig = KICK.core.Util.applyConfig,
            hasProperty = KICK.core.Util.hasProperty;

        // create objects
        for (var i=0;i<gameObjects.length;i++){
            var gameObjectSrc = gameObjects[i];
            var gameObjectDest = editorScene.createGameObject({name:gameObjectSrc.name});
            gameObjectDest.proxyFor = gameObjectSrc;
            gameObjectDest.destUid = gameObjectSrc.uid;
            originalUidToNewUidMap[gameObjectSrc.uid] = gameObjectDest.uid;

            var comps = gameObjectSrc.components;
            for (var j=0;j<comps.length;j++){
                var comp = comps[j];
                var type = comp.type;
                if (type === "KICK.scene.Transform"){
                    newComponents.push(gameObjectDest.transform);
                    gameObjectDest.transform.proxyFor = comp;
                    originalUidToNewUidMap[comp.uid] = engine.getUID(gameObjectDest.transform);
                } else {
                    if (type === "KICK.scene.MeshRenderer" || type === "KICK.scene.Light"){
                        var constructor = KICK.namespace(type);
                        var componentInstance = new constructor();
                        componentInstance.proxyFor = comp;
                        gameObjectDest.addComponent(componentInstance);
                        originalUidToNewUidMap[comp.uid] = engine.getUID(componentInstance);
                        newComponents.push(componentInstance);
                    } else {
                        continue;
                    }
                }
                componentsConfigs.push(comp.config);
            }
        }

        // loads a component based on the original uid
        var sceneProxy = {
            getObjectByUID: function(uid){
                return thisObj.lookupSceneObjectBasedOnOriginalUID(uid);
            }
        };

        // apply config
        var sceneRootObjectTransform = sceneRootObject.transform;
        for (i=0;i<componentsConfigs.length;i++){
            var newComponent = newComponents[i];
            var config = componentsConfigs[i];
            var configCopy = {};
            for (var name in config){
                if (hasProperty(config,name)){
                    var value = config[name];
                    value = KICK.core.Util.deserializeConfig(value, engine, sceneProxy);
                    configCopy[name] = value;
                }
            }
            applyConfig(newComponent,configCopy);
            if (newComponent instanceof KICK.scene.Transform){
                if (!newComponent.parent){
                    newComponent.parent = sceneRootObjectTransform;
                }
            }
        }

        // change parent to sceneRootObject
    };

    /**
     * @method loadProject
     * @param {Object} projectConfig
     */
    this.loadProject = function(projectConfig){
        console.log("projectConfig");
        console.log(JSON.stringify( projectConfig,null,3));
        engine.project.loadProject(projectConfig);
        editorScene = getEditorScene();
        if (engine.activeScene && engine.activeScene.name.indexOf("__") !== 0){
            engine.project.removeCacheReference(engine.activeScene.uid);
        }
        engine.activeScene = editorScene;
        console.log("LoadProject");
        var projectSettingsName = "Project settings";
        var projectSettingsType = "ProjectSettings";
        var projectSettings = engine.project.loadByName(projectSettingsName, projectSettingsType);
        if (!projectSettings){
            new ProjectSettings(engine,{name:projectSettingsName});
        }
    };

    Object.defineProperties(this,{
        /**
         * @property gridEnabled
         * @type Boolean
         */
        gridEnabled: {
            get: function(){
                return gridComponent.enabled;
            },
            set: function(newValue){
                gridComponent.enabled = newValue;
            }
        },
        /**
         * @property engine
         * @type KICK.core.Engine
         */
        engine:{
            get:function(){
                return engine;
            }
        }
    });
};