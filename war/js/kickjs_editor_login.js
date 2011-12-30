YUI().use('node','panel', function(Y) {
    var
        panelCreateProject,
        loadingElem = Y.one("#loading"),
        loginLocalButton = Y.one("#loginLocal"),
        loginServerButton = Y.one("#loginServer"),
        projectsElement = Y.one("#projects"),
        projectNameElement = Y.one("#projectName"),
        serverObject = KICKED.server,
        validProjectName,
        projectNameTimer,
        panel = new Y.Panel({
            srcNode      : '#panelContent',
            headerContent: 'Open/Create project',
            width        : 250,
            zIndex       : 5,
            centered     : true,
            modal        : true,
            visible      : false,
            render       : true
        });
    /**
     * Lookup projects on the serve and add the projects to the project list
     * If no projects are found, then hide the load project button
     * @method listProjects
     */
    var listProjects = function(){
        var onSuccess = function(response){
            var projects = response.response.projects;
            projectsElement.setContent("");
            if (projects.length){
                projectsElement.removeClass("hiddenElement");
            } else {
                projectsElement.addClass("hiddenElement");
            }
            for (var i = 0;i<projects.length;i++){
                var name = projects[i];
                var optionElement = projectsElement.create("<option></option>")
                optionElement.setContent(name);
                optionElement.set("value",name);
                if (i==0){
                    optionElement.set("selected","selected");
                }
                projectsElement.appendChild(optionElement);
            }
            if (projects.length<1){
                panel._buttonsArray[2].node.hide();
            } else {
                panel._buttonsArray[2].node.show();
            }
            panel.show();
        };
        var onError = function(e){
            console.log(e);
            alert("Error - try again later");
        };
        serverObject.project.list(onSuccess,onError);
    };

    /**
     * Set the
     * @method setProjectNameValid
     * @param valid
     */
    var setProjectNameValid = function(valid){
        var node = panelCreateProject._buttonsArray[1].node;
        var projectNameStatus = Y.one("#projectNameStatus");
        if (valid){
            node.removeClass("buttonDisabled");
            projectNameStatus.setContent("");
        } else {
            node.addClass("buttonDisabled");
            var name = projectNameElement.get("value");
            if (name.length>0){
                projectNameStatus.setContent("Invalid project name");
            }
        }
        validProjectName = valid;
    };

    /**
     * Ask the server for valid project name
     * @method serverProjectName
     */
    var serverProjectName = function(){
        var name = projectNameElement.get("value");
        var onSuccess = function(resp){
            var valid = resp.response ? resp.response.nameValid : false;
            setProjectNameValid(valid);
            projectNameTimer = null;
        };
        if (name.length){
            serverObject.project.isNameValid(name,onSuccess,onSuccess);
        } else {
            onSuccess(false);
        }
    };

    var setupValidateNameTimer = function(){
        if (projectNameTimer){ // Cancel any current timer
            clearTimeout(projectNameTimer);
        }
        projectNameTimer = setTimeout(serverProjectName,500);
    };

    var createProjectAndLoadProject = function(){
        setLoading();
        var name = projectNameElement.get("value");
        var onSuccess = function(){
            hideLoading();
            loadProject(name);
        };
        var onError = function(){
            alert("Error creating project - try again");
            hideLoading();
        };
        serverObject.project.create(name,onSuccess, onError);
        validProjectName = false;
    };

    /**
     * Add create project button
     */
    panel.addButton({
        value  : 'Create project',
        section: Y.WidgetStdMod.FOOTER,
        action : function (e) {
            e.preventDefault();
            validProjectName = false;
            if (panelCreateProject){
                projectNameElement.set("value","");
                panelCreateProject.show();
                return;
            }

            /**
             * Create panelCreateProject panel
             */
            panelCreateProject = new Y.Panel({
                width      : 300,
                zIndex     : 6,
                centered   : true,
                modal      : true,
                srcNode    : '#panelCreateProject',
                render      : true,
                buttons: [
                    {
                        value  : 'Cancel',
                        section: Y.WidgetStdMod.FOOTER,
                        action : function (e) {
                            e.preventDefault();
                            panelCreateProject.hide();
                        }
                    },{
                        value  : 'Create',
                        section: Y.WidgetStdMod.FOOTER,
                        action : function (e) {
                            if (validProjectName && !projectNameTimer){
                                e.preventDefault();
                                panelCreateProject.hide();
                                panel.hide();
                                createProjectAndLoadProject();
                            }
                        }
                    }
                ]
            });
            setProjectNameValid(false);
            projectNameElement.on("keyup",function(e){
                if (!projectNameTimer && e.keyCode === 13 && validProjectName){
                    createProjectAndLoadProject();
                }
                setupValidateNameTimer();
            });
        }
    });

    panel.addButton({
        value  : 'Load project',
        section: Y.WidgetStdMod.FOOTER,
        action : function (e) {
            var selectedIndex = projectsElement.get("selectedIndex");
            if (selectedIndex == -1){
                return;
            }
            var options = projectsElement.get("options").get("nodes");
            var value = options[selectedIndex].get("value");
            if (value && value.length){
                panel.hide();
                e.preventDefault();
                loadProject(value);
            }
        }
    });

    /**
     * Redirect to website with load project
     * @param {String} projectName
     */
    var loadProject = function(projectName){
        document.location.href = "/editor.html#useServer="+(serverObject===KICKED.server)+"&project="+encodeURIComponent(projectName);
    };

    /**
     * Set loading state
     * @method setLoading
     */
    var setLoading = function(){
        loadingElem.addClass("hiddenElement");
    };

    /**
     * Hide loading state
     * @method hideLoading
     */
    var hideLoading = function(){
        loadingElem.addClass("hiddenElement");
    };
    /**
     * Check if user is logged in. If logged in make 'server' button listProjects() else make the user login
     * @method checkLogin
     */
    var checkLogin = function(){
        var responseSuccess = function(response){
            if (response.loginURL){
                loginServerButton.setContent("Login to use Server version");
                loginServerButton.set("href",response.loginURL);
            } else {
                loginServerButton.on("click",function(){
                    serverObject = KICKED.server;
                    listProjects();
                });
            }
            loginServerButton.removeClass("hiddenElement");
            loginLocalButton.removeClass("hiddenElement");
            loginLocalButton.on("click",function(){
                serverObject = KICKED.localStorage;
                listProjects();
            });
            hideLoading();
        };
        var responseError = function(e){
            alert("Server error - only local storage available");
            loginLocalButton.removeClass("hiddenElement");
            loginLocalButton.on("click",function(){
                serverObject = KICKED.localStorage;
                listProjects();
            });
            hideLoading();
        };
        serverObject.login(responseSuccess,responseError);
    };
    checkLogin();
});


   