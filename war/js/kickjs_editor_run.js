"use strict";
var KICK = window.KICK || {};
var serverObject;

KICK.onRunLoad = function(){
    window.addEventListener('message',function(event) {
        if(event.origin !== location.origin) return;
        KICK.onMessage(event.data);
    },false);
    if (window.msg){
        KICK.onMessage(window.msg);
    }
};

KICK.onMessage = function(data){
    var dataObject = JSON.parse(data);
    if (dataObject.action === "loadProject"){
        KICK.loadProject(dataObject);
    }
    else{
        console.log(data);
    }
};

KICK.loadProject = function(dataObject){
    serverObject = dataObject.useServer? KICKED.server:KICKED.localStorage;
    var canvas = document.getElementById('kickjs_canvas');
    canvas.width = dataObject.projectSettings.canvasWidth;
    canvas.height = dataObject.projectSettings.canvasHeight;
    var engine = new KICK.core.Engine(canvas,dataObject.projectSettings);
    engine.project.loadProject(dataObject.projectConfig);
};

