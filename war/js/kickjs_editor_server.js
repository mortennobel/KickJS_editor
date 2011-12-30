
var KICKED = {};

KICKED.server = {};

KICKED.server.jsonGetRequest = function(url, requestData, responseFn, errorFn){
    var oReq = new XMLHttpRequest();

    function handler()
    {
        if (oReq.readyState == 4 /* complete */) {
            if (oReq.status == 200) {
                var obj = JSON.parse(oReq.response);
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
    oReq.responseType = 'text';
    oReq.onreadystatechange = handler;
    oReq.send();
};

/**
 * @method login
 * @param responseFn Callback function with the signature
 */
KICKED.server.login = function(responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        url: document.location.href
    };
    KICKED.server.jsonGetRequest("/LoginInfo",requestData,responseFn,errorFn);
};


/**
 * @class project
 * @namespace KICKED.server
 */
KICKED.server.project = {};

/**
 * @method list
 * @param responseFn Callback function with the signature
 */
KICKED.server.project.list = function(responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"list"
    };
    KICKED.server.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method create
 * @param responseFn Callback function with the signature
 */
KICKED.server.project.create = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"create",
        name:name
    };
    KICKED.server.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method delete
 * @param responseFn Callback function with the signature
 */
KICKED.server.project.delete = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"delete",
        name:name
    };
    KICKED.server.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method isNameValid
 * @param responseFn Callback function with the signature
 */
KICKED.server.project.isNameValid = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"isNameValid",
        name:name
    };
    KICKED.server.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method load
 * @param responseFn Callback function with the signature
 */
KICKED.server.project.load = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"load",
        name:name
    };
    KICKED.server.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @class resource
 * @namespace KICKED
 */
KICKED.server.resource = {};

/**
 * Init a resource (meaning setting the meta data and get a upload url if successful)
 * @method init
 */
KICKED.server.resource.init = function(projectName, uid, contentType,contentName,responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"init",
        projectName:projectName,
        uid:uid,
        contentType:contentType,
        contentName:contentName
    };
    KICKED.server.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};

/**
 * Update a resource
 * @method update
 */
KICKED.server.resource.update = function(projectName, uid, contentType,contentName,responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"update",
        projectName:projectName,
        uid:uid,
        contentType:contentType,
        contentName:contentName
    };
    KICKED.server.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};

/**
 * Upload a resource (basically wraps init/update and then a post for uploading the resource)
 * @method upload
 * @param projectName
 * @param uid
 * @param contentType
 * @param contentName
 * @param content
 * @param newResource
 * @param responseFn
 * @param errorFn
 */
KICKED.server.resource.upload = function(projectName, uid, contentType,contentName, content, newResource ,responseFn,errorFn){
    var initOrUpload = newResource ? KICKED.server.resource.init : KICKED.server.resource.update;
    var response = function(resp){
        console.log(resp.response?resp.response.uploadUrl:resp); // todo remove
        var uploadUrl = resp.response.uploadUrl;
        var formdata = new FormData();
        if (typeof content === "string"){
            var BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;
            var bb = new BlobBuilder();
            bb.append(content);
            content = bb.getBlob('text/plain');
        }
        formdata.append("uploadFile", content);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl, true);
        function handler()
        {
            if (xhr.readyState == 4 /* complete */) {
                if (xhr.status == 200) {
                    var obj = xhr.response;
                    if (obj && obj.length){
                        obj = JSON.parse(obj);
                    }
                    responseFn(obj);
                } else {
                    errorFn({status:xhr.status,message:xhr.responseText});
                }
            }
        }
        xhr.responseType = 'text';
        xhr.onreadystatechange = handler;
        xhr.send(formdata);
    };
    initOrUpload(projectName,uid,contentType,contentName,response,errorFn);
};

/**
 * @method delete
 */
KICKED.server.resource.delete = function(projectName, uid, responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"delete",
        projectName:projectName,
        uid:uid
    };
    KICKED.server.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};

/**
 * @method list
 */
KICKED.server.resource.list = function(projectName,responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"list",
        projectName:projectName
    };
    KICKED.server.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};

/**
 * @method load
 * @param {String} projectName
 * @param {Number} uid
 * @param {Function} responseFn Function(response)
 * @param {Function} errorFn
 * @param {boolean} convertToJSON Optional default false. Otherwise
 */
KICKED.server.resource.load = function(projectName,uid,responseFn,errorFn, convertToJSON){
    var oReq = new XMLHttpRequest();

    function handler()
    {
        if (oReq.readyState == 4 /* complete */) {
            if (oReq.status == 200) {
                var obj = oReq.responseText;
                if (convertToJSON){
                    obj = JSON.parse(obj);
                }
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

    var url = '/project/'+encodeURIComponent(projectName)+"/"+uid;
    url += getDelimiter(url) +"time="+encodeURIComponent(new Date().getTime());

    oReq.open("GET", url, true);
    oReq.onreadystatechange = handler;
    oReq.send();
};

/*------------------------ local storage ---------------------------*/


KICKED.localStorage = {};

/**
 * @class project
 * @namespace KICKED.localStorage
 */
KICKED.localStorage.project = {};

/**
 * @method list
 * @param responseFn Callback function with the signature
 */
KICKED.localStorage.project.list = function(responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"list"
    };
    KICKED.server.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method create
 * @param responseFn Callback function with the signature
 */
KICKED.localStorage.project.create = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"create",
        name:name
    };
    KICKED.server.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method delete
 * @param responseFn Callback function with the signature
 */
KICKED.localStorage.project.delete = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"delete",
        name:name
    };
    KICKED.server.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method isNameValid
 * @param responseFn Callback function with the signature
 */
KICKED.localStorage.project.isNameValid = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"isNameValid",
        name:name
    };
    KICKED.server.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @method load
 * @param responseFn Callback function with the signature
 */
KICKED.localStorage.project.load = function(name,responseFn, errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"load",
        name:name
    };
    KICKED.server.jsonGetRequest("/ProjectRequest",requestData,responseFn,errorFn);
};

/**
 * @class resource
 * @namespace KICKED
 */
KICKED.localStorage.resource = {};

/**
 * Init a resource (meaning setting the meta data and get a upload url if successful)
 * @method init
 */
KICKED.localStorage.resource.init = function(projectName, uid, contentType,contentName,responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"init",
        projectName:projectName,
        uid:uid,
        contentType:contentType,
        contentName:contentName
    };
    KICKED.server.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};

/**
 * Update a resource
 * @method init
 */
KICKED.localStorage.resource.update = function(projectName, uid, contentType,contentName,responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"update",
        projectName:projectName,
        uid:uid,
        contentType:contentType,
        contentName:contentName
    };
    KICKED.server.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};

/**
 * @method delete
 */
KICKED.localStorage.resource.delete = function(projectName, uid, responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"delete",
        projectName:projectName,
        uid:uid
    };
    KICKED.server.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};

/**
 * @method list
 */
KICKED.localStorage.resource.list = function(projectName,responseFn,errorFn){
    var requestData = {
        ts:new Date().getTime(),
        action:"list",
        projectName:projectName
    };
    KICKED.server.jsonGetRequest("/ResourceRequest",requestData,responseFn,errorFn);
};

/**
 * @method load
 * @param {String} projectName
 * @param {Number} uid
 * @param {Function} responseFn Function(response)
 * @param {Function} errorFn
 * @param {boolean} convertToJSON Optional default false. Otherwise
 */
KICKED.localStorage.resource.load = function(projectName,uid,responseFn,errorFn, convertToJSON){
    var oReq = new XMLHttpRequest();

    function handler()
    {
        if (oReq.readyState == 4 /* complete */) {
            if (oReq.status == 200) {
                var obj = oReq.responseText;
                if (convertToJSON){
                    obj = JSON.parse(obj);
                }
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
    var url = '/project/'+encodeURIComponent(projectName)+"/"+uid;
    url += getDelimiter(url) +"time="+encodeURIComponent(new Date().getTime());

    oReq.open("GET", url, true);
    oReq.onreadystatechange = handler;
    oReq.send();
};


KICKED.localStorage.resource.upload = KICKED.server.resource.upload;