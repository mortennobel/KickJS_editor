"use strict";
var ComponentPanelModule;

// decorate objects
KICK.scene.Transform.prototype.createEditorGUI = function(propertyEditor, object){
    var configObject = object.proxyFor;
    propertyEditor.setTitle("Transform");
    propertyEditor.addVector("localPosition", "Position",null,null,function(name, value){
        object.localPosition = value;
        console.log("was ",configObject);
        configObject.config.localPosition = value;
        console.log("now ",configObject);
    });
    propertyEditor.addVector("localRotationEuler", "Rotation",null,null,function(name,value){
        object.localRotationEuler = value;
        configObject.config.localRotationEuler = value;
    });
    propertyEditor.addVector("localScale", "Scale",null,null,function(name,value){
        object.localScale = value;
        configObject.config.localScale = value;
    },null,null,0.1);
};

KICK.scene.MeshRenderer.prototype.createEditorGUI = function(propertyEditor, object){
    var sceneObject = sceneEditorApp.view.lookupSceneObjectBasedOnOriginalUID(object.uid);
    propertyEditor.setTitle("MeshRenderer");
    for (var i=0;i<object.config.materials.length;i++){
        (function(i){
            var updateValue = function (name, value){
                value = engine.project.load(value);
                var materials = sceneObject.materials;
                materials[i] = value;
                sceneObject.materials = materials;
                object.config.materials[i].name = value.name;
                object.config.materials[i].ref = value.uid;
            };
            propertyEditor.addAssetPointer("material", "Material","", object.config.materials.length?object.config.materials[i].ref:0 ,"KICK.material.Material",updateValue);
        })(i);
    }
    function UpdateMesh(name, value){
        value = engine.project.load(value);
        sceneObject.mesh = value;
        object.config.mesh.name = value.name;
        object.config.mesh.ref = value.uid;
    }
    propertyEditor.addAssetPointer("mesh", "Mesh","", object.config.mesh?object.config.mesh.ref:0,"KICK.mesh.Mesh",UpdateMesh);
};

KICK.scene.Camera.prototype.createEditorGUI = function(propertyEditor, object){
    propertyEditor.setTitle("Camera");
    propertyEditor.addBoolean("enabled", "Enabled");
    propertyEditor.addEnum("perspective", "Type",null, [
        {value:1,name:"Perspective"},
        {value:0,name:"Orthographic"}
    ]);
    propertyEditor.addNumber("fieldOfView", "Field of view Y","Perspective only");
    propertyEditor.addNumber("near", "Near clip plane");
    propertyEditor.addNumber("far", "Far clip plane");
    propertyEditor.addNumber("left", "Left","Orthographic only");
    propertyEditor.addNumber("right", "Right","Orthographic only");
    propertyEditor.addNumber("bottom", "Bottom","Orthographic only");
    propertyEditor.addNumber("top", "top","Orthographic only");
    propertyEditor.addSeparator();
    propertyEditor.addBoolean("clearFlagDepth", "Clear depth buffer");
    propertyEditor.addBoolean("clearFlagColor", "Clear color buffer");
    propertyEditor.addColor("clearColor", "Clear color");
    propertyEditor.addSeparator();
    propertyEditor.addBoolean("renderShadow", "Render shadow");
    propertyEditor.addNumber("layerMask", "Layer mask", "Camera renders only objects where the components layer exist in the layer mask.");
    propertyEditor.addVector("normalizedViewportRect", "Viewport", "xOffset,yOffset,xWidth,yHeight");
    propertyEditor.addNumber("cameraIndex", "Camera Index", "The sorting order when multiple cameras exists in the scene.Cameras with lowest number is rendered first.");
    propertyEditor.addAssetPointer("renderTarget", "Render target", "Set the render target of the camera. Null means screen framebuffer.",0,"KICK.texture.RenderTexture",null,true);
};

KICK.scene.Light.prototype.createEditorGUI = function(propertyEditor, object){
    var c = KICK.core.Constants,
        lightName;
    switch(object.type){
        case c._LIGHT_TYPE_AMBIENT:
            lightName = "Ambient light";
            break;
        case c._LIGHT_TYPE_DIRECTIONAL:
            lightName = "Directinoal light";
            break;
        case c._LIGHT_TYPE_POINT:
            lightName = "Point light";
            break;
        default:
            lightName = "Unknown light";
            break;
    }
    propertyEditor.setTitle(lightName);
    propertyEditor.addColor("color", "Color");
    propertyEditor.addNumber("intensity", "Intensity");
    if (object.type===c._LIGHT_TYPE_DIRECTIONAL){
        propertyEditor.addBoolean("shadow", "Shadow");
        propertyEditor.addNumber("shadowBias", "Shadow bias");
        propertyEditor.addNumber("shadowStrength", "Shadow strength");
    }
};

KICK.texture.Texture.prototype.createEditorGUI = function(propertyEditor, object){
    var c = KICK.core.Constants;
    var setValueAndApply = function(name,value){
        propertyEditor.setValue(name,value);
        var runtimeObject = engine.project.load(object.uid);
        runtimeObject.apply();
    };
    propertyEditor.setTitle("Texture");
    propertyEditor.addBoolean("flipY", "Flip Y","When importing image flip the Y direction of the image");
    propertyEditor.addBoolean("generateMipmaps", "Generate mipmaps","Autogenerate mipmap levels");
    propertyEditor.addEnum("internalFormat", "Internal format",null, [
        {value:c.GL_ALPHA,name:"Alpha"},
        {value:c.GL_RGB,name:"RGB"},
        {value:c.GL_RGBA,name:"RGBA"},
        {value:c.GL_LUMINANCE,name:"Luminance"},
        {value:c.GL_LUMINANCE_ALPHA,name:"Luminance alpha"}
        ]);
    propertyEditor.addEnum("magFilter", "Magnification filter",null, [
        {value:c.GL_NEAREST,name:"Nearest"},
        {value:c.GL_LINEAR,name:"Linear"}
        ],setValueAndApply);
    propertyEditor.addEnum("minFilter", "Minification filter",null, [
        {value:c.GL_NEAREST,name:"GL_NEAREST"},
        {value:c.GL_LINEAR,name:"GL_LINEAR"},
        {value:c.GL_NEAREST_MIPMAP_NEAREST,name:"GL_NEAREST_MIPMAP_NEAREST"},
        {value:c.GL_LINEAR_MIPMAP_NEAREST,name:"GL_LINEAR_MIPMAP_NEAREST"},
        {value:c.GL_NEAREST_MIPMAP_LINEAR,name:"GL_NEAREST_MIPMAP_LINEAR"},
        {value:c.GL_LINEAR_MIPMAP_LINEAR,name:"GL_LINEAR_MIPMAP_LINEAR"}
        ],setValueAndApply);
    propertyEditor.addEnum("wrapS", "Wrap S",null, [
        {value:c.GL_CLAMP_TO_EDGE,name:"Clamp to edge"},
        {value:c.GL_REPEAT,name:"Repeat"}
    ],setValueAndApply);
    propertyEditor.addEnum("wrapT", "Wrap T",null, [
        {value:c.GL_CLAMP_TO_EDGE,name:"Clamp to edge"},
        {value:c.GL_REPEAT,name:"Repeat"}
    ],setValueAndApply);
    if (debug){
        propertyEditor.addInfo("dataURI",object.config.dataURI);
    }
};

KICK.material.Shader.prototype.createEditorGUI = function(propertyEditor, object){
    var c = KICK.core.Constants;
    propertyEditor.setTitle("Shader");
    propertyEditor.addBoolean("blend", "Blend","In RGBA mode, pixels can be drawn using a function that blends the incoming (source) RGBA values with the RGBA values that are already in the frame buffer (the destination values");
    var blendFactorOptions = [
        {value:c.GL_ZERO,name:"Zero"},
        {value:c.GL_ONE,name:"One"},
        {value:c.GL_SRC_COLOR,name:"Src color"},
        {value:c.GL_ONE_MINUS_SRC_COLOR,name:"One minus src color"},
        {value:c.GL_DST_COLOR,name:"Dst color"},
        {value:c.GL_ONE_MINUS_DST_COLOR,name:"One minus dst color"},
        {value:c.GL_ONE_MINUS_SRC_ALPHA,name:"One minus src alpha"},
        {value:c.GL_DST_ALPHA,name:"Dst alpha"},
        {value:c.GL_ONE_MINUS_DST_ALPHA,name:"One minus dst alpha"},
        {value:c.GL_CONSTANT_COLOR,name:"Constant color"},
        {value:c.GL_ONE_MINUS_CONSTANT_COLOR,name:"One minus constant color"},
        {value:c.GL_CONSTANT_ALPHA,name:"Constant alpha"},
        {value:c.GL_ONE_MINUS_CONSTANT_ALPHA,name:"One minus constant alpha"},
        {value:c.GL_SRC_ALPHA_SATURATE,name:"Src alpha saturate"}
    ];
    propertyEditor.addEnum("blendSFactor", "Blend S Factor",null, blendFactorOptions);
    propertyEditor.addEnum("blendDFactor", "Blend D Factor",null, blendFactorOptions);
    propertyEditor.addBoolean("depthMask", "Depth mask","Enable or disable writing into the depth buffer");
    propertyEditor.addEnum("faceCulling", "Face Culling","Note that in faceCulling = FRONT, BACK or FRONT_AND_BACK with face culling enabled faceCulling = NONE means face culling disabled", [
        {value:c.GL_FRONT,name:"Front"},
        {value:c.GL_BACK,name:"Back"},
        {value:c.GL_FRONT_AND_BACK,name:"Front and back"},
        {value:c.GL_NONE,name:"None"}
        ]);
    propertyEditor.addBoolean("polygonOffsetEnabled","Polygon offset");
    propertyEditor.addNumber("polygonOffsetFactor","Polygon offset factor");
    propertyEditor.addNumber("polygonOffsetUnits","Polygon offset units");
    propertyEditor.addNumber("renderOrder","renderOrder","Render order. Default value 1000. The following ranges are predefined:\n0-999: Background. Mainly for skyboxes etc\n1000-1999 Opaque geometry (default)\n2000-2999 Transparent. This queue is sorted in a back to front order before rendering.\n3000-3999 Overlay");
    propertyEditor.addEnum("zTest", "zTest",null, [
        {value:c.GL_NEVER,name:"GL_NEVER"},
        {value:c.GL_LESS,name:"GL_LESS"},
        {value:c.GL_EQUAL,name:"GL_EQUAL"},
        {value:c.GL_LEQUAL,name:"GL_LEQUAL"},
        {value:c.GL_GREATER,name:"GL_GREATER"},
        {value:c.GL_NOTEQUAL,name:"GL_NOTEQUAL"},
        {value:c.GL_GEQUAL,name:"GL_GEQUAL"},
        {value:c.GL_ALWAYS,name:"GL_ALWAYS"}
    ]);
    if (debug){
        propertyEditor.addInfo("dataURI",object.config.dataURI);
    }
};

KICK.mesh.Mesh.prototype.createEditorGUI = function(propertyEditor, object){
    propertyEditor.setTitle("Mesh");
    propertyEditor.addInfo("Name",object.config.name);
    propertyEditor.addInfo("dataURI",object.config.dataURI);
};

KICK.material.Material.prototype.createEditorGUI = function(propertyEditor, object){
    var c = KICK.core.Constants,
        uniforms = object.config.uniforms,
        setValueOrTexture = function(name, value){
            var uid = object.uid;
            var projectAsset = engine.project.load(uid);
            var uniforms = projectAsset.uniforms;
            var type = uniforms[name].type;
            if (type === c.GL_SAMPLER_2D || type === c.GL_SAMPLER_CUBE){
                uniforms[name].value = engine.project.load(value);
            } else if (Array.isArray(value)) {
                for (var i=0;i<value.length;i++){
                    uniforms[name].value[i] = value[i];
                }
            } else {
                uniforms[name].value = value;
            }
            projectAsset.uniforms = uniforms;
        },
        setValueShader = function(name,value){
            var uid = object.uid;
            var projectAsset = engine.project.load(uid);
            var shader = engine.project.load(value);
            if (shader){
                projectAsset[name] = shader;
            } else {
                console.log("Cannot find shader "+uid);
            }
        };

    propertyEditor.setTitle("Material");
    propertyEditor.addAssetPointer("shader", "Shader","", object.config.shader.ref ,"KICK.material.Shader",setValueShader);
    for (var name in uniforms){
        if (!uniforms.hasOwnProperty(name)){
            continue;
        }
        var value = uniforms[name];
        switch (value.type){
            case c.GL_FLOAT:
            case c.GL_INT:
            case c.GL_INT_VEC2:
            case c.GL_INT_VEC3:
            case c.GL_INT_VEC4:
            case c.GL_FLOAT_VEC2:
            case c.GL_FLOAT_VEC3:
            case c.GL_FLOAT_VEC4:
                if (name.toLowerCase().indexOf("color")>=0 && (value.type === c.GL_FLOAT_VEC3 || value.type === c.GL_FLOAT_VEC4)){
                    propertyEditor.addColor(name, name,null,value.value, setValueOrTexture);
                } else {
                    propertyEditor.addVector(name, name,null,value.value, setValueOrTexture);
                }
                break;
            case c.GL_SAMPLER_2D:
            case c.GL_SAMPLER_CUBE:
                propertyEditor.addAssetPointer(name, name,null,value.value.ref,"KICK.texture.Texture", setValueOrTexture);
                break;
            default:
                console.log("Not mapped "+value.type);
                break;
        }
    }
};

/**
 * PropertyEditor
 * @class PropertyEditor
 * @constructor
 * @param {YUI} Y
 */
var PropertyEditor = function(Y){
    var engine = sceneEditorApp.engine,
        propertyPanelMenu = Y.one("#propertyPanelMenu"),
        propertyPanelHeader = Y.one("#propertyPanelHeader"),
        PropertyPanelModule = Y.Base.create("propertyPanelModule", Y.Widget, [Y.WidgetStdMod]),
        components = [],
        destroyComponents = function(){
            for (var i=0;i<components.length;i++){
                components[i].destroy();
            }
            components.length = 0;
        };
    ComponentPanelModule = Y.Base.create("componentPanelModule", Y.Widget, [Y.WidgetStdMod]);

    // Render from Markup
    var propertyPanel = new PropertyPanelModule({
        contentBox: "#propertyPanel"
    });
    propertyPanel.render();

    propertyPanel.setStdModContent("header", "");
    propertyPanel.setStdModContent("body", "");
    propertyPanel.setStdModContent("footer", "");

    /**
     * Set the content of the property editor
     * @method setContent
     * @param {Object} object
     * @param {Boolean} isGameObject
     */
    this.setContent = function(object, isGameObject){
        destroyComponents();
        if (!object){
            propertyPanel.setStdModContent("header", "");
            propertyPanel.setStdModContent("body","");
            propertyPanel.hide();
            propertyPanelMenu.hide();
            propertyPanelHeader.hide();
            return;
        }
        propertyPanel.show();
        propertyPanel.setStdModContent("header", "Properties: "+(object.name || "GameObject #"+object.uid));
        propertyPanel.setStdModContent("body","");
        if (isGameObject){
            propertyPanelMenu.show();
            propertyPanelHeader.show();
            propertyPanelHeader.setContent("GameObject");
            for (var i=0;i<object.components.length;i++){
                var component = object.components[i];
                if (component.type === "KICK.scene.Transform"){
                    var sceneTransform = sceneEditorApp.view.lookupSceneObjectBasedOnOriginalUID(component.uid);
                    propertyPanel.setStdModContent("body", '<div id="componentContainer_'+i+'"></div>',Y.WidgetStdMod.AFTER);
                    var compEditor = new PropertyEditorSection(Y, sceneTransform ,"componentContainer_"+i);
                    components.push(compEditor);
                } else {
                    propertyPanel.setStdModContent("body", '<div id="componentContainer_'+i+'"></div>',Y.WidgetStdMod.AFTER);
                    var compEditor = new PropertyEditorSection(Y, component,"componentContainer_"+i,true);
                    components.push(compEditor);
                }
            }
        } else if (object instanceof KICK.core.ResourceDescriptor){
            propertyPanelMenu.hide();
            propertyPanelHeader.show();
            propertyPanelHeader.setContent("Project Asset");
            propertyPanel.setStdModContent("body", '<div id="componentContainer"></div>',Y.WidgetStdMod.AFTER);
            var resourceEditor = new PropertyEditorSection(Y, object,"componentContainer");
            components.push(resourceEditor);
        }
    };

    this.setContent(); // nothing selected
};

/**
 * PropertyEditorSection
 * @class PropertyEditorSection
 * @param Y
 * @param {KICK.scene.Component | KICK.core.ResourceDescriptor} object
 * @param {String} id
 */
var PropertyEditorSection = function(Y, object, id, isGameObjectComponent){
    var c = KICK.core.Constants,
        engine = sceneEditorApp.engine,
        thisObj = this,
        isResourceDescriptor = object instanceof KICK.core.ResourceDescriptor,
        value,
        createEditorGUI,
        componentPanel = new ComponentPanelModule(
            {
                contentBox: "#"+id
            }),
        getValue = function(name){
            if (isResourceDescriptor){
                return object.config[name];
            }
            return object[name];
        },
        setValue = function(name, value){
            if (isResourceDescriptor){
                var uid = object.uid;
                var projectAsset = engine.project.load(uid);
                projectAsset[name] = value;
            } else {
                if (typeof object[name] === "object" && !Array.isArray(value)){
                    if (value instanceof KICK.scene.GameObject){
                        value = engine.activeScene.getObjectByUID(value);
                    } else {
                        value = engine.project.load(value);
                    }
                }
                object[name] = value;
            }
        },
        /**
         * Creates a gui based on the JSON value of the object. This method is only used if the object does not have a
         * createEditorGUI method itself.
         * @method createGUIBasedOnJSON
         * @private
         */
        createGUIBasedOnJSON = function(){
            var conf = object;
            if (object.toJSON){
                conf = object.toJSON().config;
            }
            for (var name in conf){
                if (!conf.hasOwnProperty(name) || name === "uid"){
                    continue;
                }
                if (isResourceDescriptor && name === "name"){
                    continue; // rename is done same way as GameObject rename
                }

                value = object[name];
                var typeofValue = typeof value;
                if (typeofValue === "string"){
                    thisObj.addString(name,name);
                } else if (typeofValue === "number"){
                    // addNumber(name,name);
                    thisObj.addFieldTitle(name);
                } else if (typeofValue === "boolean"){
                    thisObj.addBoolean(name,name);
                } else if (typeofValue === "undefined"){
                    // ignore
                    thisObj.addFieldTitle(name);
                } else if (value instanceof KICK.scene.GameObject){
                    thisObj.addFieldTitle(name);
                    console.debug("GameObject selection not implemented");
                } else if (Array.isArray(value)){
                    thisObj.addVector(name,null,null,value);
                } else { // assume asset
                    var uid = value.uid;
                    var resourceDescriptor = engine.project.getResourceDescriptor(uid);
                    thisObj.addAssetPointer(name, name,null,uid,resourceDescriptor.type);
                }
            }
        };

    /**
     * Default set value function
     * @method setValue
     * @param {String} name
     * @param {Object} value
     */
    this.setValue = setValue;

    /**
     * Returns a node name based on type, name and index
     * @param {String} type
     * @param {Number} name
     * @param {Number} index
     * @return {String} node name
     */
    this.getNodeName = function(type,name,index){
        return type+"_"+id+'_'+name+"_"+index;
    };

    /**
     * @method addFieldTitle
     * @param {String} name
     * @param {String} tooltip optional
     */
    this.addFieldTitle = function(name, tooltip){
        tooltip = tooltip ? tooltip.replace('"','&quot;') : "";
        var content = '<div class="yui3-u-1"><div class="content" title="'+tooltip+'">'+name+'</div></div>';
        componentPanel.render();
        componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
    };
    /**
     * @method addAssetPointer
     * @param {String} name
     * @param {String} displayname
     * @param {String} tooltip
     * @param {Number} uid
     * @param {String} type
     * @param {Function} setValueFn Optional default ComponentEditor.setValue
     * @param {boolean} allowNull optional
     */
    this.addAssetPointer = function(name, displayname, tooltip, uid, type, setValueFn,allowNull){
        displayname = displayname || name;
        thisObj.addFieldTitle(displayname, tooltip);
        var nodeId = thisObj.getNodeName("string",name,0),
            content = '<div class="yui3-u-1"><div class="content"><select class="propSelect" id="'+nodeId+'"/></div></div>',
            selected,
            item,
            i,
            asset,
            assetName;

        componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
        componentPanel.render();
        var node = Y.one("#"+nodeId);

        if (node){
            var engineAssets = engine.project.getEngineResourceDescriptorsByType(type);
            var assets = engine.project.getResourceDescriptorsByType(type);
            if (allowNull) {
                selected = !uid ? "selected" : "";
                item = Y.Node.create('<option value="" ' + selected + '></option>');
                node.append(item);
            }
            var parentNode = node;
            if (engineAssets.length){
                item = Y.Node.create('<optgroup label="Engine Assets"></optgroup>');
                node.append(item);
                parentNode = item;
                for (i=0;i<engineAssets.length;i++){
                    asset = engineAssets[i];
                    if ((asset.name && asset.name.indexOf('__') === 0)){
                        continue;
                    }
                    assetName = asset.name || "No name";
                    if (debug){
                        assetName += " "+asset.config.uid;
                    }
                    selected = asset.config.uid === uid ? "selected":"";
                    item = Y.Node.create('<option value="'+asset.config.uid+'" '+selected+'>'+assetName+'</option>');
                    parentNode.append(item);
                }

                item = Y.Node.create('<optgroup label="Project Assets"></optgroup>');
                node.append(item);
                parentNode = item;

            }

            for (i=0;i<assets.length;i++){
                asset = assets[i];
                if ((asset.name && asset.name.indexOf('__') === 0) || asset.uid < 0){
                    continue;
                }
                assetName = asset.name || "No name";
                if (debug){
                    assetName += " "+asset.uid;
                }
                selected = asset.config.uid === uid ? "selected":"";
                item = Y.Node.create('<option value="'+asset.uid+'" '+selected+'>'+assetName+'</option>');
                parentNode.append(item);
            }

            var updateModel = function(){
                var newUid = parseInt(Y.one("#"+nodeId).get('value'));
                setValueFn = setValueFn || setValue;
                setValueFn(name,newUid);
            };
            node.on("change",updateModel);
            node.after("click",updateModel);
            node.after("keyup",updateModel);
        }
    };
    /**
     * @method addEnum
     * @param {String} name
     * @param {String} displayname
     * @param {String} tooltip
     * @param {Array[Object]} enumValues Example [{value:0,name:"False"},{value:1,name:"True"}]
     * @param {Function} setValueFn Optional default ComponentEditor.setValue
     */
    this.addEnum = function(name, displayname, tooltip, enumValues, setValueFn){
        displayname = displayname || name;
        thisObj.addFieldTitle(displayname, tooltip);
        var nodeId = thisObj.getNodeName("string",name,0);
        var content = '<div class="yui3-u-1"><div class="content"><select class="propSelect" id="'+nodeId+'"/></div></div>';
        var value = getValue(name);
        componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
        componentPanel.render();
        var node = Y.one("#"+nodeId);

        if (node){
            for (var i=0;i<enumValues.length;i++){
                var t = enumValues[i];
                var selected = t.value === value ? "selected":"";
                var item = Y.Node.create('<option value="'+t.value+'" '+selected+'>'+t.name+'</option>');
                node.append(item);
            }

            var updateModel = function(){
                var newUid = parseInt(Y.one("#"+nodeId).get('value'));
                setValueFn = setValueFn || setValue;
                setValueFn(name,newUid);
            };
            node.on("change",updateModel);
            node.after("click",updateModel);
            node.after("keyup",updateModel);
        }
    };

    /**
     * @method addString
     * @param {String} name
     * @param {String} displayname
     * @param {String} tooltip
     * @param {Function} setValueFn Optional default ComponentEditor.setValue
     */
    this.addString = function(name, displayname, tooltip, setValueFn){
        displayname = displayname || name;
        thisObj.addFieldTitle(displayname, tooltip);
        var nodeId = thisObj.getNodeName("string",name,0);
        var value = getValue(name);
        var content = '<div class="yui3-u-1"><div class="content"><input type="text" class="propString" id="'+nodeId+'" value="'+value+'"></div></div>';
        componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
        componentPanel.render();
        var node = Y.one("#"+nodeId);

        if (node){
            var updateModel = function(){
                var newValue = Y.one("#"+nodeId).get('value');
                setValueFn = setValueFn || setValue;
                setValueFn(name,newValue);
            };
            node.on("change",updateModel);
            node.after("click",updateModel);
            node.after("keyup",updateModel);
        }
    };
    /**
     * @method addNumber
     * @param {String} name
     * @param {String} displayname
     * @param {String} tooltip
     * @param {Function} setValueFn Optional default ComponentEditor.setValue
     * @param {Number} min
     * @param {Number} max
     * @param {Number} step
     */
    this.addNumber= function(name, displayname, tooltip, setValueFn, min, max, step){
        if (typeof min !== "number"){
            min = Number.MIN_VALUE;
        }
        if (typeof max !== "number"){
            max = Number.MAX_VALUE;
        }
        if (typeof step !== "number"){
            step = 1;
        }

        displayname = displayname || name;
        thisObj.addFieldTitle(displayname, tooltip);
        var nodeId = thisObj.getNodeName("string",name,0);
        var value = getValue(name);
        var content = '<div class="yui3-u-1"><div class="content"><input type="number" class="propString" id="'+nodeId+'" value="'+value+'" min="'+min+'" max="'+max+'" step="'+step+'"></div></div>';
        componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
        componentPanel.render();
        var node = Y.one("#"+nodeId);

        if (node){
            var updateModel = function(){
                var newValue = parseFloat(Y.one("#"+nodeId).get('value'));
                setValueFn = setValueFn || setValue;
                setValueFn(name,newValue);
            };
            node.on("change",updateModel);
            node.after("click",updateModel);
            node.after("keyup",updateModel);
        }
    };

    /**
     * @method addBoolean
     * @param {String} name
     * @param {String} displayname Optional default name value
     * @param {String} tooltip Optional default none
     * @param {Function} setValueFn Optional default ComponentEditor.setValue
     */
    this.addBoolean = function(name, displayname, tooltip, setValueFn){
        displayname = displayname || name;
        thisObj.addFieldTitle(displayname, tooltip);
        var nodeId = thisObj.getNodeName("string",name,0);
        var value = getValue(name)==true;
        console.log(name+"="+value);
        var content = '<div class="yui3-u-1"><div class="content"><input type="checkbox" class="propBoolean" id="'+nodeId+'" '+(value?"checked":"")+'></div></div>';
        componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
        componentPanel.render();
        var node = Y.one("#"+nodeId);

        if (node){
            var updateModel = function(){
                var newValue = Y.one("#"+nodeId).get('checked');
                setValueFn = setValueFn || setValue;
                setValueFn(name,newValue);
            };
            node.on("change",updateModel);
            node.after("click",updateModel);
            node.after("keyup",updateModel);
        }
    };
    /**
     * @method addColor
     * @param {String} name
     * @param {String} displayname
     * @param {String} tooltip
     * @param {Array[Number]} value
     * @param {Function} setValueFn Optional default ComponentEditor.setValue
     */
    this.addColor = function(name, displayname, tooltip,value, setValueFn){
        // todo - make color picker
        return thisObj.addVector(name, displayname, tooltip,value, setValueFn, 0,1,0.05);
    };
    /**
     * @method addVector
     * @param {String} name
     * @param {String} displayname
     * @param {String} tooltip
     * @param {Array[Number]} value
     * @param {Function} setValueFn Optional default ComponentEditor.setValue
     * @param {Number} min optional, default Number.MIN_VALUE
     * @param {Number} max optional, default Number.MAX_VALUE
     * @param {Number} step optional, default 1
     */
    this.addVector = function(name, displayname, tooltip,value, setValueFn, min, max, step){
        var i,nodeId;
        if (typeof min !== "number"){
            min = -Number.MAX_VALUE;
        }
        if (typeof max !== "number"){
            max = Number.MAX_VALUE;
        }
        if (typeof step !== "number"){
            step = 1;
        }
        displayname = displayname || name;
        thisObj.addFieldTitle(displayname, tooltip);
        value = value || getValue(name);
        var content = "",
            valueLength = value.length;
        for (i = 0;i<valueLength;i++){
            nodeId = thisObj.getNodeName("vector",name,i);
            content += '<div class="yui3-u-1-'+valueLength+'"><div class="content"><input type="number" class="propNumber" id="'+nodeId+'" value="'+value[i]+'" min="'+min+'" max="'+max+'" step="'+step+'"></a></div></div>';
        }
        componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
        componentPanel.render();
        for (i = 0;i<valueLength;i++){
            nodeId = thisObj.getNodeName("vector",name,i);
            var node = Y.one("#"+nodeId);
            if (node){
                var updateModel = function(){
                    var newValue = [];
                    for (i=0;i<value.length;i++){
                        newValue[i] = parseFloat(Y.one("#"+thisObj.getNodeName("vector",name,i)).get('value'));
                    }
                    setValueFn = setValueFn || setValue;
                    setValueFn(name,newValue);
                };
                node.on("change",updateModel);
                node.after("click",updateModel);
                node.after("keyup",updateModel);
            }
        }
    };
    /**
     * @method addInfo
     * @param {String} name
     * @param {String} info
     */
    this.addInfo = function(name,info){
        thisObj.addFieldTitle(name);
        thisObj.addFieldTitle(info);
    };
    /**
     * @method addSeparator
     */
    this.addSeparator = function(){
        componentPanel.setStdModContent("body","<hr/>",Y.WidgetStdMod.AFTER);
    };

    /**
     * @method addButton
     * @param title
     * @param tooltip
     * @param {Function} onClickFn
     *
     */
    this.addButton = function(title, tooltip, onClickFn){
        var id = "button"+new Date().getTime();
        var content = '<div class="yui3-u-1"><div class="content" title="'+tooltip+'"><button id="'+id+'" class="yui3-button">'+title+'</button></div></div>';
        componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
        componentPanel.render();
        Y.one("#"+id).on('click',onClickFn);
    };

    componentPanel.hide();

    /**
     * @method setTitle
     * @param {String} title
     */
    this.setTitle = function(title){
        var toogleButton = '<div title="Show/Hide" class="component-toggle"></div>';
        var deleteButton = '<a title="Delete component" class="component-delete">[X]</a>';
        if (object instanceof KICK.scene.Transform || isResourceDescriptor){
            deleteButton = "";
        }
        componentPanel.setStdModContent("header", title+toogleButton+deleteButton);
        componentPanel.render();
        var header = componentPanel.getStdModNode("header");
        header.addClass("propertyComponentHeader");
        var toogleComponents = Y.all(".component-toggle");
        toogleComponents.each(function(node){
            if (node.getAttribute("clickListener")){
                console.log("Already has listener");
                return;
            }
            node.setAttribute("clickListener",true);
            node.on("click",function(e){
                var body = componentPanel.getStdModNode("body");
                if (body){
                    body.toggleClass("hiddenContent");
                }
                node.toggleClass("component-collapsed");
                e.preventDefault();
            });
        });
        var deleteComponents = Y.all(".component-delete");
        deleteComponents.each(function(node){
            if (node.getAttribute("clickListener")){
                console.log("Already has listener");
                return;
            }
            node.setAttribute("clickListener",true);
            node.on("click", function(e){
                sceneEditorApp.view.deleteComponent(object.uid);
            });
        });
    };

    if (object.createEditorGUI){
        createEditorGUI = object.createEditorGUI;
    } else if (object instanceof KICK.core.ResourceDescriptor || isGameObjectComponent){
        createEditorGUI = KICK.namespace(object.type).prototype.createEditorGUI;
    }
    if (createEditorGUI){
        createEditorGUI(this,object);
    } else {
        createGUIBasedOnJSON();
    }
    componentPanel.render();
    var body = componentPanel.getStdModNode ( "body" );
    if (body){
        body.addClass("yui3-g");
    }

    /**
     * @method destroy
     */
    this.destroy = function(){
        componentPanel.destroy();
    }
};

