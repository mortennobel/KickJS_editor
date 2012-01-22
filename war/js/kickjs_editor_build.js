function ProjectBuild(Y,engine,panel){
    var
        buildProjectFilter = function(object){
            if (object instanceof KICK.scene.GameObject || object instanceof KICK.core.ResourceDescriptor){
                var name = object.name || "";
                return name.indexOf("__")!==0;
            }
            return true;
        },
        generateZipContent = function(onComplete, onError){
                var zip = new JSZip();
                var project = engine.project,
                    H = Y.Handlebars,
                    projectJson = project.toJSON(buildProjectFilter),
                    isZipComplete = false,
                    activeRequests = 0,
                    getAbsoluteURL = function(url){
                        if (url.indexOf('/')===0){
                            var oldUrl = url;
                            url = location.origin + url;
                        }
                        return url;
                    },
                    checkZipComplete = function(){
                        if (isZipComplete && activeRequests === 0){
                            var content = zip.generate();
                            onComplete(content);
                        }
                    },
                    addBinaryResource = function(url,name){

                    },
                    addTextResource = function(url,name,handlebarConfig){
                        activeRequests++;
                        url = getAbsoluteURL(url);
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
                zip.add("project.json", JSON.stringify(projectJson,null,debug?3:0));
                addTextResource("/dist/export-template.html","index.html",
                    {
                        canvasWidth: 300,
                        canvasHeight:350,
                        projectName: projectName
                    });
                addTextResource("/js/kick-min-0.3.0.js","kick-min-0.3.0.js");
                addTextResource("/dist/initKickJS.handlebar","initKickJS.js",
                                project.getResourceDescriptorByType('ProjectSettings')[0].config);
                isZipComplete = true;
            };
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
                transparent: true,
                append: false,
                dataType: 'base64'
            });
        };

        Y.one("#projectBuildButton").hide();
        generateZipContent(showDownloadButton);
    };
}