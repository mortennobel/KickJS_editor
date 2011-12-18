
var KICKED = {};

KICKED.jsonGetRequest = function(url, requestData, responseFn, errorFn){
    var oReq = new XMLHttpRequest();

    function handler()
    {
        if (oReq.readyState == 4 /* complete */) {
            if (oReq.status == 200) {
                var obj = JSON.parse(oReq.responseText);
                responseFn(obj);
            } else {
                errorFn({status:oReq.status,message:oReq.responseText});
            }
        }
    }
    function getDelimiter(url){
        var hasParameter = url.indexOf('?')>0;
        return hasParameter?"&":"?";
    }

    for (var name in requestData){
        var delimiter = getDelimiter(url);
        url += delimiter +encodeURIComponent(name)+"="+encodeURIComponent(requestData[name]);
    }
    oReq.open("GET", url, true);
    oReq.onreadystatechange = handler;
    oReq.send();
};

/**
 * @method login
 * @param responseFn Callback function with the signature
 */
KICKED.login = function(responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        url: document.location.href
    };
    KICKED.jsonGetRequest("/LoginInfo",requestData,responseFn,errorFn);
};


/**
 * @class project
 * @namespace KICKED
 */
KICKED.project = {};

/**
 * @method list
 * @param responseFn Callback function with the signature
 */
KICKED.project.list = function(responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"list"
    };
    KICKED.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method create
 * @param responseFn Callback function with the signature
 */
KICKED.project.create = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"create",
        name:name
    };
    KICKED.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method delete
 * @param responseFn Callback function with the signature
 */
KICKED.project.delete = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"delete",
        name:name
    };
    KICKED.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method isNameValid
 * @param responseFn Callback function with the signature
 */
KICKED.project.isNameValid = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"isNameValid",
        name:name
    };
    KICKED.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method load
 * @param responseFn Callback function with the signature
 */
KICKED.project.load = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"load",
        name:name
    };
    KICKED.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @class resource
 * @namespace KICKED
 */
KICKED.resource = {};

/**
 * Init a resource (meaning setting the meta data and get a upload url if successful)
 * @method init
 */
KICKED.resource.init = function(projectName, uid, contentType,contentName,responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"init",
        projectName:projectName,
        uid:uid,
        contentType:contentType,
        contentName:contentName
    };
    KICKED.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};

/**
 * Update a resource
 * @method init
 */
KICKED.resource.update = function(projectName, uid, contentType,contentName,responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"update",
        projectName:projectName,
        uid:uid,
        contentType:contentType,
        contentName:contentName
    };
    KICKED.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};

/**
 * @method delete
 */
KICKED.resource.delete = function(projectName, uid, responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"delete",
        projectName:projectName,
        uid:uid
    };
    KICKED.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};

/**
 * @method list
 */
KICKED.resource.list = function(projectName,responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"list",
        projectName:projectName
    };
    KICKED.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};







