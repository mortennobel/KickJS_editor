/**
 * @class ProjectSettings
 * @param {KICK.core.Engine} engine
 * @param {Object} config
 * @constructor
 */
function ProjectSettings(engine, config){
    var thisObj = this,
        uid,
        name = "",
        alpha = true,
        antialias = true,
        premultipliedAlpha = true,
        checkCanvasResizeInterval = 0,
        shadows = false,
        maxNumerOfLights = 1,
        canvasHeight = 300,
        canvasWidth = 300;

    Object.defineProperties(this,{
        canvasHeight:{
            get:function(){
                return canvasHeight;
            },
            set:function(newValue){
                canvasHeight = newValue;
            }
        },
        canvasWidth:{
            get:function(){
                return canvasWidth;
            },
            set:function(newValue){
                canvasWidth = newValue;
            }
        },
        uid:{
            get:function(){
                return uid;
            },
            set:function(newValue){
                uid = newValue;
            }
        },
        alpha:{
            get:function(){
                return alpha;
            },
            set:function(newValue){
                alpha = newValue;
            }
        },
        name:{
            get:function(){
                return name;
            },
            set:function(newValue){
                name = newValue;
            }
        },
        antialias:{
            get:function(){
                return antialias;
            },
            set:function(newValue){
                antialias = newValue;
            }
        },
        premultipliedAlpha:{
            get:function(){
                return premultipliedAlpha;
            },
            set:function(newValue){
                premultipliedAlpha = newValue;
            }
        },
        checkCanvasResizeInterval:{
            get:function(){
                return checkCanvasResizeInterval;
            },
            set:function(newValue){
                checkCanvasResizeInterval = parseInt(newValue) || 0;
            }
        },
        shadows:{
            get:function(){
                return shadows;
            },
            set:function(newValue){
                shadows = newValue;
            }
        },
        maxNumerOfLights:{
            get:function(){
                return maxNumerOfLights;
            },
            set:function(newValue){
                maxNumerOfLights = parseInt(newValue) || 0;
            }
        }
    });


    KICK.core.Util.applyConfig(thisObj,config);
    engine.project.registerObject(thisObj, "ProjectSettings");

    /**
     * @method toJSON
     * @return {Object}
     */
    this.toJSON = function(){
        return {
            uid: thisObj.uid,
            name:name,
            alpha:alpha,
            antialias:antialias,
            premultipliedAlpha:premultipliedAlpha,
            checkCanvasResizeInterval:checkCanvasResizeInterval,
            shadows:shadows,
            maxNumerOfLights:maxNumerOfLights,
            canvasHeight: canvasHeight,
            canvasWidth: canvasWidth
        };
    };
};

ProjectSettings.prototype.createEditorGUI = function(propertyEditor, object){
    propertyEditor.setTitle("Project settings");
    propertyEditor.addBoolean("alpha", "Alpha", "If the value is true, the drawing buffer has an alpha channel for the purposes of performing OpenGL destination alpha operations and compositing with the page. If the value is false, no alpha buffer is available.");
    propertyEditor.addBoolean("antialias", "Antialias", "If the value is true and the implementation supports antialiasing the drawing buffer will perform antialiasing using its choice of technique (multisample/supersample) and quality. If the value is false or the implementation does not support antialiasing, no antialiasing is performed.");
    propertyEditor.addBoolean("premultipliedAlpha", "PremultipliedAlpha", " If the value is true the page compositor will assume the drawing buffer contains colors with premultiplied alpha. If the value is false the page compositor will assume that colors in the drawing buffer are not premultiplied. This flag is ignored if the alpha flag is false. See Premultiplied Alpha for more information on the effects of the premultipliedAlpha flag.");
    propertyEditor.addNumber("checkCanvasResizeInterval", "Check Canvas Resize Interval", "Polling of canvas resize. Default is 0 (meaning not polling)",null,0.0,Number.MAX_VALUE,100);
    propertyEditor.addBoolean("shadows", "Shadows", "Use shadow maps to generate realtime shadows.");
    propertyEditor.addNumber("maxNumerOfLights", "Point lights", "Max number of point lights.",null,0,8,1);
    propertyEditor.addSeparator();
    propertyEditor.addNumber("canvasWidth", "Canvas width", null,null,1,8096,1);
    propertyEditor.addNumber("canvasHeight", "Canvas height", null,null,1,8096,1);
    propertyEditor.addSeparator();
    propertyEditor.addButton("Delete project", "Delete the project permanently", sceneEditorApp.deleteProject);

};