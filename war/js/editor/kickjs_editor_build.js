"use strict";

/**
 * ProjectBuild
 * @class ProjectBuild
 * @constructor
 * @param {YUI} Y
 * @param engine
 * @param panel
 */
function ProjectBuild(Y,engine,panel){
    var
        buildProjectFilter = ProjectBuild.buildProjectFilter,
        generateZipContent = function(onComplete, onError){
            var zip = new JSZip();
            var project = engine.project,
                H = Y.Handlebars,
                projectJson = project.toJSON(buildProjectFilter),
                projectSettings = project.getResourceDescriptorsByType('ProjectSettings')[0].config,
                isZipComplete = false,
                activeRequests = 0,
                verifyValidInitialScene = function(projectSettings){
                    var scene = engine.project.getResourceDescriptor(projectSettings.initialScene);
                    if (!scene || scene.name.indexOf('__') === 0){
                        // invalid name
                        // choose any other scene name
                        var allScenes = engine.project.getResourceDescriptorsByType("KICK.scene.Scene");
                        for (var i=0;i<allScenes.length;i++){
                            if (allScenes[i].name.indexOf('__')!==0){
                                projectSettings.initialScene = allScenes[i].uid;
                                break;
                            }
                        }
                    }
                },
                checkZipComplete = function(){
                    if (isZipComplete && activeRequests === 0){
                        var content = zip.generate();
                        onComplete(content);
                    }
                },
                addBinaryResourceByUID = function(uid,name){
                    activeRequests++;
                    var onResourceLoadSuccess = function(value){
                        zip.addBinary(name, value);
                        activeRequests--;
                        checkZipComplete();
                    };
                    serverObject.resource.load(projectName, uid, onResourceLoadSuccess, onError);
                },
                addBinaryResourceByURL = function(url,name){
                    activeRequests++;
                    var oXHR = new XMLHttpRequest();
                    oXHR.open("GET", url, true);
                    oXHR.responseType = "arraybuffer";
                    oXHR.onreadystatechange = function (oEvent) {
                        if (oXHR.readyState === 4) {
                            if (oXHR.status === 200) {
                                activeRequests--;
                                var value = oXHR.response;
                                zip.addBinary(name, value);
                            } else {
                                console.log("Error", oXHR.statusText);
                                onError();
                            }
                            checkZipComplete();
                        }
                    };
                    oXHR.send(null);
                },
                addTextResourceByURL = function(url,name,handlebarConfig){
                    activeRequests++;
                    var oXHR = new XMLHttpRequest();
                    oXHR.open("GET", url, true);
                    oXHR.onreadystatechange = function (oEvent) {
                        if (oXHR.readyState === 4) {
                            if (oXHR.status === 200) {
                                activeRequests--;
                                var value = oXHR.responseText;
                                if (handlebarConfig){
                                    var copy = {};
                                    for (var n in handlebarConfig){
                                        copy[n] = String(handlebarConfig[n]);
                                    }
                                    var template = H.compile(value);
                                    value = template(copy);
                                }
                                zip.add(name, value);
                            } else {
                                console.log("Error", oXHR.statusText);
                                onError();
                            }
                            checkZipComplete();
                        }
                    };
                    oXHR.send(null);
                };

            // copy textures & mesh
            for (var i=0;i<projectJson.resourceDescriptors.length;i++){
                var resourceDescriptor = projectJson.resourceDescriptors[i];
                var url = null;
                if (resourceDescriptor.type === "KICK.mesh.Mesh"){
                    url = resourceDescriptor.uid+".kickjs";
                }
                else if (resourceDescriptor.type === "KICK.texture.Texture"){
                    url = resourceDescriptor.uid+".png";
                }
                if (url){
                    addBinaryResourceByUID(resourceDescriptor.uid,url);
                    resourceDescriptor.config.dataURI = url;
                }
            }
            verifyValidInitialScene(projectSettings);
            projectJson.activeScene = projectSettings.initialScene;
            zip.add("project.json", JSON.stringify(projectJson,null,debug?3:0));
            var reloadTS = "?ts="+new Date().getTime();
            // copy existing resouces
            addTextResourceByURL("/dist/export-template.html"+reloadTS,"index.html",
                {
                    canvasWidth: projectSettings.canvasWidth,
                    canvasHeight:projectSettings.canvasHeight,
                    projectName: projectName
                });
            addTextResourceByURL("/js/kick-min-0.3.2.js"+reloadTS,"kick-min-0.3.2.js");
            addTextResourceByURL("/dist/initKickJS.handlebar"+reloadTS,"initKickJS.js",projectSettings);
            addTextResourceByURL("/dist/readme.html","readme.html");
            addBinaryResourceByURL("/dist/SimpleWebServer.jar","SimpleWebServer.jar");
            isZipComplete = true;
        };

    /**
     * @method projectBuild
     */
    this.projectBuild = function(){
        var removeFlashButton = function(){
            var buildButton = Y.one("#projectBuildButton");
            buildButton.get("children").remove();
        };
        panel.set("headerContent", "Build and export");
        panel.setStdModContent(Y.WidgetStdMod.BODY, Y.one("#exportProjectForm").getDOMNode().innerHTML);
        panel.set("buttons", []);
        panel.addButton({
            value  : 'Cancel',
            section: Y.WidgetStdMod.FOOTER,
            action : function (e) {
                removeFlashButton();
                panel.hide();
                e.preventDefault ();
            }
        });
        panel.render();
        panel.show();

        var showDownloadButton = function(zipContent){
            Y.one("#projectBuildProgressBar").hide();
            Y.one("#projectBuildButton").show();
            Downloadify.create('projectBuildButton',{
                filename: function(){
                    return "KickJS_Project.zip";
                },
                data: function(){
                    return zipContent;
                },
                onComplete: function(){
                    removeFlashButton();
                    panel.hide();
                    alert('Project has been exported!');
                },
                onCancel: function(){
                    removeFlashButton();
                    panel.hide();
                },
                onError: function(e){
                    removeFlashButton();
                    panel.hide();
                    console.log('Error during export'+e);
                    alert('Error during export');
                },
                transparent: false,
                swf: '/js/downloadtify/downloadify.swf',
                downloadImage: '/images/export.png',
                width: 140,
                height: 28,
                append: false,
                dataType: 'base64'
            });
        };

        Y.one("#projectBuildButton").hide();
        generateZipContent(showDownloadButton);
    };
}

/**
 * @method buildProjectFilter
 * @param object
 * @static
 */
ProjectBuild.buildProjectFilter = function(object){
    if (object instanceof KICK.scene.GameObject || object instanceof KICK.core.ResourceDescriptor){
        var name = object.name || "";
        return name.indexOf("__")!==0 && object.type !== "ProjectSettings";
    }
    return true;
};