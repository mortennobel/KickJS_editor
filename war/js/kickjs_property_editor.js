var ComponentPanelModule;

var PropertyEditor = function(Y,sceneEditorApp){
    var engine = sceneEditorApp.engine;
    var PropertyPanelModule = Y.Base.create("propertyPanelModule", Y.Widget, [Y.WidgetStdMod]),
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
            propertyPanel.hide();
            return;
        }
        propertyPanel.show();
        propertyPanel.setStdModContent("header", "Properties: "+(object.name || "GameObject #"+object.uid));
        propertyPanel.setStdModContent("body","");
        if (object instanceof KICK.scene.GameObject){
            for (var i=0;i<object.numberOfComponents;i++){
                var component = object.getComponent(i);
                propertyPanel.setStdModContent("body", '<div id="componentContainer_'+i+'"></div>',Y.WidgetStdMod.AFTER);
                var compEditor = new ComponentEditor(Y, sceneEditorApp, component,"componentContainer_"+i);
                components.push(compEditor);
            }
        } else if (object instanceof KICK.core.ResourceDescriptor){
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
        componentJSON,
        isResourceDescriptor = object instanceof KICK.core.ResourceDescriptor,
        componentPanel = new ComponentPanelModule(
        {
            contentBox: "#"+id
        }),
        setValue = function(name, value){
            if (isResourceDescriptor){
                var isMaterial = object.type === "KICK.material.Material";
                var uid = object.uid;
                var projectAsset = engine.project.load(uid);
                if (isMaterial){
                    var uniforms = projectAsset.uniforms;
                    var type = uniforms[name].type;
                    if (type === c.GL_SAMPLER_2D || type === c.GL_SAMPLER_CUBE){
                        uniforms[name].value = engine.project.load(value);
                    } else {
                        uniforms[name].value = value;
                    }

                    projectAsset.uniforms = uniforms;
                } else {
                    projectAsset[name] = value;
                }
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
        },
        getNodeName = function(type,name,i){
            return type+"_"+id+'_'+name+"_"+i;
        },
        addFieldTitle = function(name, tooltip){
            tooltip = tooltip ? tooltip.replace('"','&quot;') : "";
            var content = '<div class="yui3-u-1"><div class="content" title="'+tooltip+'">'+name+'</div></div>';
            componentPanel.render();
            componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
        },
        addAssetPointer = function(name, displayname, tooltip, uid, type){
            displayname = displayname ||Êname;
            addFieldTitle(displayname, tooltip);
            var nodeId = getNodeName("string",name,0);
            var content = '<div class="yui3-u-1"><div class="content"><select class="propSelect" id="'+nodeId+'"/></div></div>';
            componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
            componentPanel.render();
            var node = Y.one("#"+nodeId);

            if (node){
                var assets = engine.project.getResourceDescriptorByType(type);
                for (var i=0;i<assets.length;i++){
                    var t = assets[i];
                    if (t.name.indexOf('__')==0){
                        continue;
                    }
                    var selected = t.uid === uid ? "selected":"";
                    console.log("selected: "+selected+ " value: "+uid);
                    console.log(uid);
                    var item = Y.Node.create('<option value="'+t.uid+'" '+selected+'>'+t.name+'</option>');
                    node.append(item);
                }

                var updateModel = function(){
                    var newUid = parseInt(Y.one("#"+nodeId).get('value'));
                    setValue(name,newUid);
                };
                node.on("change",updateModel);
                node.after("click",updateModel);
                node.after("keyup",updateModel);
            }
        },
        addString = function(name, displayname, tooltip){
            displayname = displayname ||Êname;
            addFieldTitle(displayname, tooltip);
            var nodeId = getNodeName("string",name,0);
            var value = object[name];
            var content = '<div class="yui3-u-1"><div class="content"><input type="text" class="propString" id="'+nodeId+'" value="'+value+'"></div></div>';
            componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
            componentPanel.render();
            var node = Y.one("#"+nodeId);

            if (node){
                var updateModel = function(){
                    var newValue = Y.one("#"+nodeId).get('value');
                    setValue(name,newValue);
                    console.log("Set "+name+" to "+object[name]+" object "+object);
                };
                node.on("change",updateModel);
                node.after("click",updateModel);
                node.after("keyup",updateModel);
            }
        },
        addVector = function(name, displayname, tooltip,value){
            var i,nodeId;
            displayname = displayname ||Êname;
            addFieldTitle(displayname, tooltip);
            value = value || object[name];
            var content = "";
            for (i = 0;i<value.length;i++){
                nodeId = getNodeName("vector",name,i);
                content += '<div class="yui3-u-1-3"><div class="content"><input type="number" class="propNumber" id="'+nodeId+'" value="'+value[i]+'"></a></div></div>';
            }
            componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
            componentPanel.render();
            for (i = 0;i<value.length;i++){
                nodeId = getNodeName("vector",name,i);
                var node = Y.one("#"+nodeId);

                if (node){
                    var updateModel = function(){
                        var newValue = [];
                        for (i=0;i<value.length;i++){
                            newValue[i] = parseFloat(Y.one("#"+getNodeName("vector",name,i)).get('value'));
                        }
                        setValue(name,newValue);
                    };
                    node.on("change",updateModel);
                    node.after("click",updateModel);
                    node.after("keyup",updateModel);
                }

            }
        };
    if (!object.toJSON){
        componentJSON = KICK.core.Util.componentToJSON(scene.engine,object);
    } else {
        componentJSON = object.toJSON();
    }
    componentPanel.hide();
    componentPanel.setStdModContent("header", componentJSON.type);

    if (componentJSON.type === "KICK.scene.Transform"){
        addVector("position", "Position");
        addVector("rotationEuler", "Rotation");
        addVector("localScale", "Scale");
    } else {
        var conf = object;
        if (object.toJSON){
            conf = object.toJSON().config;
        }
        var isMaterial = object.type === "KICK.material.Material";
        if (isMaterial){
            conf = conf.uniforms;
        }
        for (var name in conf){
            if (name === "uid"){
                continue;
            }
            if (isResourceDescriptor && name === "name"){
                continue; // rename is done same way as GameObject rename
            }

            if (isMaterial){
                var value = conf[name];
                switch (value.type){
                    case c.GL_INT_VEC2:
                    case c.GL_INT_VEC3:
                    case c.GL_INT_VEC4:
                    case c.GL_FLOAT_VEC2:
                    case c.GL_FLOAT_VEC3:
                    case c.GL_FLOAT_VEC4:
                        addVector(name, name,null,value.value);
                        break;
                    case c.GL_SAMPLER_2D:
                    case c.GL_SAMPLER_CUBE:
                        addAssetPointer(name, name,null,value.value.ref,"KICK.texture.Texture");
                        break;
                    default:
                        console.log("Not mapped "+value.type);
                        break;
                }
            } else {
                var value = object[name];
                var valueJson;
                var typeofValue = typeof value;
                if (typeofValue === "string"){
                    addString(name,name);
                } else if (typeofValue === "number"){
                    // addNumber(name,name);
                    addFieldTitle(name);
                } else if (typeofValue === "boolean"){
                    // addBoolean(name,name);
                    addFieldTitle(name);
                } else if (typeofValue === "undefined"){
                    // ignore
                    addFieldTitle(name);
                } else if (isMaterial){
                    addFieldTitle(name);
                    console.log("material "+name);
                } else if (value instanceof KICK.scene.GameObject){
                    addFieldTitle(name);
                    console.debug("GameObject selection not implemented");
                } else if (Array.isArray(value)){
                    addFieldTitle(name);
                    console.debug("Array selection not implemented");
                } else { // assume asset
                    var uid = value.uid;
                    var resourceDescriptor = engine.project.getResourceDescriptor(uid);
                    addAssetPointer(name, name,null,uid,resourceDescriptor.type);
                }
            }
        }
    }
    componentPanel.render();
    componentPanel.getStdModNode ( "body" ).addClass("yui3-g");

    this.destroy = function(){
        componentPanel.destroy();
    }
};

