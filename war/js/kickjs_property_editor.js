var ComponentPanelModule;

var PropertyEditor = function(Y){
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
            var engine = object.engine;
            for (var i=0;i<object.numberOfComponents;i++){
                var component = object.getComponent(i);
                propertyPanel.setStdModContent("body", '<div id="transformContainer_'+i+'"></div>',Y.WidgetStdMod.AFTER);
                var compEditor = new ComponentEditor(Y, engine, component,"transformContainer_"+i);
                components.push(compEditor);
            }
        }
    };

    this.setContent(); // nothing selected
};

/**
 *
 * @param Y
 * @param {KICK.scene.Component} component
 * @param {String} id
 */
var ComponentEditor = function(Y, engine, component, id){
    var componentPanel = new ComponentPanelModule(
        {
            contentBox: "#"+id
        }),
        componentJSON,
        getNodeName = function(name,i){
            return "vector_"+id+'_'+name+"_"+i;
        },
        addFieldTitle = function(name, tooltip){
            tooltip = tooltip ? tooltip.replace('"','&quot;') : "";
            var content = '<div class="yui3-u-1"><div class="content" title="'+tooltip+'">'+name+'</div></div>';
            componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
        },
        addVector = function(name, displayname, tooltip){
            var i,nodeId;
            displayname = displayname ||Êname;
            addFieldTitle(displayname, tooltip);
            var value = component[name];
            var content = "";
            for (i = 0;i<value.length;i++){
                nodeId = getNodeName(name,i);
                content += '<div class="yui3-u-1-3"><div class="content"><input type="number" class="propNumber" id="'+nodeId+'" value="'+value[i]+'"></a></div></div>';
            }
            componentPanel.setStdModContent("body",content,Y.WidgetStdMod.AFTER);
            componentPanel.render();
            for (i = 0;i<value.length;i++){
                nodeId = getNodeName(name,i);
                var node = Y.one("#"+nodeId);

                if (node){
                    var updateModel = function(){
                        var newValue = [];
                        for (i=0;i<value.length;i++){
                            newValue[i] = parseFloat(Y.one("#"+getNodeName(name,i)).get('value'));
                        }
                        component[name] = newValue;
                        console.log("Set "+name+" to ",newValue)
                    };
                    node.on("change",updateModel);
                    node.after("click",updateModel);
                    node.after("keyup",updateModel);
                }

            }
        };
    if (!component.toJSON){
        componentJSON = KICK.core.Util.componentToJSON(scene.engine,component);
    } else {
        componentJSON = component.toJSON();
    }
    componentPanel.hide();
    componentPanel.setStdModContent("header", componentJSON.type);

    if (componentJSON.type === "KICK.scene.Transform"){
        addVector("position", "Position");
        addVector("rotationEuler", "Rotation");
        addVector("localScale", "Scale");
    } else {
        addFieldTitle("Unsupported");
    }
    componentPanel.render();
    componentPanel.getStdModNode ( "body" ).addClass("yui3-g");

    this.destroy = function(){
        componentPanel.destroy();
    }
};

