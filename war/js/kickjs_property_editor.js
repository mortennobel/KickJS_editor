var ComponentPanelModule;

// decorate objects
KICK.scene.Transform.prototype.createEditorGUI = function(propertyEditor, object){
    propertyEditor.setTitle("Transform");
    propertyEditor.addVector("position", "Position");
    propertyEditor.addVector("rotationEuler", "Rotation");
    propertyEditor.addVector("localScale", "Scale",null,null,null,null,null,0.1);
};

KICK.scene.MeshRenderer.prototype.createEditorGUI = function(propertyEditor, object){
    propertyEditor.setTitle("MeshRenderer");
    propertyEditor.addAssetPointer("material", "Material","", object.material ? object.material.uid:0 ,"KICK.material.Material");
    propertyEditor.addAssetPointer("mesh", "Mesh","", object.mesh ? object.mesh.uid:0 ,"KICK.mesh.Mesh");
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
        ]);
    propertyEditor.addEnum("minFilter", "Minification filter",null, [
        {value:c.GL_NEAREST,name:"GL_NEAREST"},
        {value:c.GL_LINEAR,name:"GL_LINEAR"},
        {value:c.GL_NEAREST_MIPMAP_NEAREST,name:"GL_NEAREST_MIPMAP_NEAREST"},
        {value:c.GL_LINEAR_MIPMAP_NEAREST,name:"GL_LINEAR_MIPMAP_NEAREST"},
        {value:c.GL_NEAREST_MIPMAP_LINEAR,name:"GL_NEAREST_MIPMAP_LINEAR"},
        {value:c.GL_LINEAR_MIPMAP_LINEAR,name:"GL_LINEAR_MIPMAP_LINEAR"}
        ]);
    propertyEditor.addEnum("wrapS", "Wrap S",null, [
        {value:c.GL_CLAMP_TO_EDGE,name:"Clamp to edge"},
        {value:c.GL_REPEAT,name:"Repeat"}
    ]);
    propertyEditor.addEnum("wrapT", "Wrap T",null, [
        {value:c.GL_CLAMP_TO_EDGE,name:"Clamp to edge"},
        {value:c.GL_REPEAT,name:"Repeat"}
    ]);
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
    propertyEditor.addInfo("MeshData",object.config.meshData);
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
            engine.project.release(uid);
        },
        setValueShader = function(name,value){
            var uid = object.uid;
            var projectAsset = engine.project.load(uid);
            var shader = engine.project.load(value);
            if (shader){
                projectAsset[name].value = shader;
            } else {
                console.log("Cannot find shader "+uid);
            }
            engine.project.release(uid);
        };

    propertyEditor.setTitle("Material");
    propertyEditor.addAssetPointer("shader", "Shader","", object.config.shader.ref ,"KICK.material.Shader",setValueShader);
    for (var name in uniforms){
        value = uniforms[name];
        switch (value.type){
            case c.GL_INT_VEC2:
            case c.GL_INT_VEC3:
            case c.GL_INT_VEC4:
            case c.GL_FLOAT_VEC2:
            case c.GL_FLOAT_VEC3:
            case c.GL_FLOAT_VEC4:
                if (name.toLowerCase().indexOf("color")>=0 && (value.type === c.GL_FLOAT_VEC3 || value.type === c.GL_FLOAT_VEC3)){
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

var PropertyEditor = function(Y,sceneEditorApp){
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

    this.setContent = function(object){
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
        if (object instanceof KICK.scene.GameObject){
            propertyPanelMenu.show();
            propertyPanelHeader.show();
            propertyPanelHeader.setContent("GameObject");
            console.log("Show propertyPanelMenu");
            for (var i=0;i<object.numberOfComponents;i++){
                var component = object.getComponent(i);
                propertyPanel.setStdModContent("body", '<div id="componentContainer_'+i+'"></div>',Y.WidgetStdMod.AFTER);
                var compEditor = new ComponentEditor(Y, sceneEditorApp, component,"componentContainer_"+i);
                components.push(compEditor);
            }
        } else if (object instanceof KICK.core.ResourceDescriptor){
            propertyPanelMenu.hide();
            propertyPanelHeader.show();
            propertyPanelHeader.setContent("Project Asset");
            propertyPanel.setStdModContent("body", '<div id="componentContainer"></div>',Y.WidgetStdMod.AFTER);
            var resourceEditor = new ComponentEditor(Y, sceneEditorApp, object,"componentContainer");
            components.push(resourceEditor);
        }
    };

    this.setContent(); // nothing selected
};

/**
 *
 * @param Y
 * @param {KICK.scene.Component | KICK.core.ResourceDescriptor} object
 * @param {String} id
 */
var ComponentEditor = function(Y, sceneEditorApp, object, id){
    var c = KICK.core.Constants,
        engine = sceneEditorApp.engine,
        thisObj = this,
        isResourceDescriptor = object instanceof KICK.core.ResourceDescriptor,
        value,
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
                engine.project.release(uid);
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
        };
    this.getNodeName = function(type,name,i){
        return type+"_"+id+'_'+name+"_"+i;
    };
    this.addFieldTitle = function(name, tooltip){
        tooltip = tooltip ? tooltip.replace('"','&quot;') : "";
        var content = '<div class="yui3-u-1"><div class="content" title="'+tooltip+'">'+name+'</div></div>';
        componentPanel.render();
        componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
    };
    this.addAssetPointer = function(name, displayname, tooltip, uid, type, setValueFn,allowNull){
        displayname = displayname || name;
        thisObj.addFieldTitle(displayname, tooltip);
        var nodeId = thisObj.getNodeName("string",name,0);
        var content = '<div class="yui3-u-1"><div class="content"><select class="propSelect" id="'+nodeId+'"/></div></div>';
        var selected;
        var item;

        componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
        componentPanel.render();
        var node = Y.one("#"+nodeId);

        if (node){
            var assets = engine.project.getResourceDescriptorByType(type);
            if (allowNull) {
                selected = !uid ? "selected" : "";
                item = Y.Node.create('<option value="" ' + selected + '></option>');
                node.append(item);
            }
            for (var i=0;i<assets.length;i++){
                var t = assets[i];
                if (t.name && t.name.indexOf('__')==0){
                    continue;
                }
                var name = t.name || "No name";
                selected = t.config.uid === uid ? "selected":"";
                item = Y.Node.create('<option value="'+t.uid+'" '+selected+'>'+t.name+'</option>');
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
     *
     * @param name
     * @param displayname
     * @param tooltip
     * @param Array[Object] enumValues Example [{value:0,name:"False"},{value:1,name:"True"}]
     * @param setValueFn
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
    this.addBoolean = function(name, displayname, tooltip, setValueFn){
        displayname = displayname ||Êname;
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
    this.addColor = function(name, displayname, tooltip,value, setValueFn){
        // todo - make color picker
        return thisObj.addVector(name, displayname, tooltip,value, setValueFn, 0,1,0.05);
    };
    this.addVector = function(name, displayname, tooltip,value, setValueFn, min, max, step){
        var i,nodeId;
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
    this.addInfo = function(name,info){
        thisObj.addFieldTitle(name);
        thisObj.addFieldTitle(info);
    };
    this.addSeparator = function(){
        componentPanel.setStdModContent("body","<hr/>",Y.WidgetStdMod.AFTER);
    };

    componentPanel.hide();

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
                var gameObject = object.gameObject;
                gameObject.removeComponent(object);
                // reload game object
                sceneEditorApp.gameObjectSelected(gameObject.uid);
            });
        });
    };

    var createGUIBasedOnJSON = function(){
        var conf = object;
        if (object.toJSON){
            conf = object.toJSON().config;
        }
        for (var name in conf){
            if (name === "uid"){
                continue;
            }
            if (isResourceDescriptor && name === "name"){
                continue; // rename is done same way as GameObject rename
            }

            value = object[name];
            var valueJson;
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
                thisObj.addFieldTitle(name);
                console.debug("Array selection not implemented");
            } else { // assume asset
                var uid = value.uid;
                var resourceDescriptor = engine.project.getResourceDescriptor(uid);
                thisObj.addAssetPointer(name, name,null,uid,resourceDescriptor.type);
            }
        }
    };

    var createEditorGUI;
    if (object instanceof KICK.core.ResourceDescriptor){
        createEditorGUI = KICK.namespace(object.type).prototype.createEditorGUI;
    } else {
        createEditorGUI = object.createEditorGUI;
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
    this.destroy = function(){
        componentPanel.destroy();
    }
};

