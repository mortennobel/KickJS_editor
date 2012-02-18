"use strict";

var KICKED = KICKED || {};

KICKED.server = {};

KICKED.server.type = "Server";

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
 * project
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
 * @param {Object} content
 * @param responseFn
 * @param errorFn
 */
KICKED.server.resource.upload = function(projectName, uid, contentType,contentName, content, responseFn,errorFn){
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
    KICKED.server.resource.update(projectName,uid,contentType,contentName,response,errorFn);
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
KICKED.localStorage.db = null;
var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

/**
 * @class project
 * @namespace KICKED.localStorage
 */
KICKED.localStorage.project = {};

KICKED.localStorage.type = "LocalStorage";

/**
 * @method list
 * @param responseFn Callback function with the signature
 */
KICKED.localStorage.project.list = function(responseFn, errorFn) {
    var projectListStr;
    var projectList;
    try{
        projectListStr = localStorage.getItem("projectList");
    }catch (e){
        console.log(e);
    }
    if (!projectListStr) {
        projectList = [];
    } else {
        projectList = projectListStr.split("?");
    }
    var response = {
        response:{
            projects:projectList
        }
    };
    if (responseFn){
        responseFn(response);
    }
    return response;
};

/**
 * @method create
 * @param responseFn Callback function with the signature
 */
KICKED.localStorage.project.create = function(name,responseFn, errorFn){
    var list = KICKED.localStorage.project.list();
    list = list.response.projects;
    for (var i=0;i<list.length;i++){
        if (list[i]===name){
            errorFn({
                message:"Project already exist"
            });
            return;
        }
    }
    list.push(name);
    var listStr = list.join("?");
    try{
        localStorage.setItem("projectList",listStr);
        responseFn({response:{}})
    }catch (e){
        console.log(e);
        errorFn({
            message:"Error saving project"
        });
    }
};

/**
 * @method delete
 * @param responseFn Callback function with the signature
 */
KICKED.localStorage.project.delete = function(name,responseFn, errorFn){
    var list = KICKED.localStorage.project.list();
    list = list.response.projects;
    for (var i=0;i<list.length;i++){
        if (list[i]===name){
            list.splice(i,1);
            break;
        }
    }
    var listStr = list.join("?");
    try{
        localStorage.setItem("projectList",listStr);
        console.log("Todo: delete resources as well "); // todo implement delete project resources as well
        responseFn({response:{}})
    }catch (e){
        console.log(e);
        errorFn({
            message:"Error saving project"
        });
    }
};

/**
 * @method isNameValid
 * @param responseFn Callback function with the signature
 */
KICKED.localStorage.project.isNameValid = function(name,responseFn, errorFn){
    var valid = name.indexOf("?")==-1 && name.indexOf("+")==-1;
    responseFn({response:{
        nameValid:valid
    }});
};

/**
 * @method load
 * @param onSuccessFn Callback function with the signature
 */
KICKED.localStorage.project.load = function(name,onSuccessFn, errorFn){
    var list = KICKED.localStorage.project.list();
    list = list.response.projects;
    var openProject = function(){
        var dbVersion = 2;
        var request = indexedDB.open(name, dbVersion);

        request.onerror = errorFn;
        var versionChange = function(event) {
            KICKED.localStorage.db.createObjectStore("asset", { keyPath: "uid" });
            console.log("IndexedDB created");
            onSuccessFn({response:{
                loaded:"ok"
            }});
        };
        request.onupgradeneeded = versionChange;
        request.onsuccess = function(){
            console.log("IndexedDB opened");
            var db = request.result;
            KICKED.localStorage.db = db;
            if(dbVersion != db.version) {
                if (db.setVersion){
                    var setVrequest = db.setVersion(dbVersion);

                    // onsuccess is the only place we can create Object Stores
                    setVrequest.onfailure = errorFn;
                    setVrequest.onsuccess = versionChange;
                }
            } else {
                onSuccessFn({response:{
                    loaded:"ok"
                }});
            }
        };
    };
    for (var i=0;i<list.length;i++){
        if (list[i]===name){
            openProject();
            return;
        }
    }
    errorFn({message:name+" not found"});
};

/**
 * @class resource
 * @namespace KICKED
 */
KICKED.localStorage.resource = {};

/**
 * @method delete
 */
KICKED.localStorage.resource.delete = function(projectName, uid, responseFn,errorFn){
    var db = KICKED.localStorage.db;
    var request = db.transaction(["asset"], IDBTransaction.READ_WRITE)
        .objectStore("asset")
        .delete(uid);
    request.onerror = errorFn;
    request.onsuccess = function(event) {
        responseFn({
            response:{
                message:"Deleted ok"
            }
        });
    };
};

/**
 * @method list
 */
KICKED.localStorage.resource.list = function(projectName,responseFn,errorFn){
    var list = [];
    var db = KICKED.localStorage.db;
    var trans = db.transaction(["asset"]);
    var store = trans.objectStore("asset");

    // Get everything in the store;
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);

    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if(result){
            list.push(result.value.uid);
            result["continue"]();     // avoid syntax highlight error in IntelliJ
        } else {
            responseFn({
                response:{
                    resources: list
                }
            });
        }
    };
    cursorRequest.onerror = errorFn;
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
    var db = KICKED.localStorage.db;
    var transaction = db.transaction(["asset"]);
    var objectStore = transaction.objectStore("asset");
    var request = objectStore.get(uid);
    request.onerror = errorFn;
    request.onsuccess = function(){
        var value = request.result;
        if (!value){ // value not found (null values are now 'allowed' in my table
            errorFn({message:"Row not found"});
        }
        else {
            var res = value.value;
            if (convertToJSON){
                res = JSON.parse(res);
            } else if (value.binary){
                var floatValue = new Int32Array(res);
                res = floatValue.buffer;
                // If size of bytearray is different size, then remove padding
                if (value.binarySize !== res.byteLength){
                    var source = new Uint8Array(res,0,value.binarySize);
                    var dest = new Uint8Array(value.binarySize);
                    dest.set(source);
                    res = dest.buffer;
                }
            }
            responseFn(res);
        }
    };
};


/**
 * @method upload
 * @param {String} projectName
 * @param {Number} uid
 * @param {String} contentType
 * @param {String} contentName
 * @param {String | ArrayBuffer |�Object} content
 * @param {Function} responseFn
 * @param {Function} errorFn
 */
KICKED.localStorage.resource.upload = function(projectName, uid, contentType,contentName, content, responseFn,errorFn){
    var isValueBinary = content instanceof ArrayBuffer;
    var binarySize = -1;
    if (isValueBinary){
        binarySize = content.byteLength;
        // if size of bytearray does not fit a int32 array then add padding to make it fit
        var byteRemainder = binarySize%4;
        if (byteRemainder !==0){
            var newArray = new ArrayBuffer(binarySize + 4 - byteRemainder); // must align with 4 bytes
            var source = new Uint8Array(content);
            var dest = new Uint8Array(newArray);
            dest.set(source);
            content = newArray;
        }
        console.log("byteLength: "+content.byteLength+ " binary size is "+binarySize);
    }
    var convertedValue = isValueBinary?KICK.core.Util.typedArrayToArray(new Int32Array(content)) :content;
    var valueContainer = {
        uid: uid,
        project: projectName,
        userPrincipal: "localuser",
        name: contentName,
        contentType: contentType,
        modified: new Date().toGMTString(),
        value:convertedValue,
        binary:isValueBinary,
        binarySize: binarySize
    };
    var db = KICKED.localStorage.db;
    var request = db.transaction(["asset"], IDBTransaction.READ_WRITE)
        .objectStore("asset")
        .put(valueContainer);
    request.onsuccess = function(){
        responseFn({response:{
            message:"Upload ok",
            dataURI: "localStorage://"+projectName+"/"+uid
        }});
    };
    request.onerror = errorFn;
};

/**
 * Delete all (for debugging purpose)
 */
KICKED.localStorage.deleteAll = function(){
    var keys = [];
    for (var i=0;i<localStorage.length;i++){
        var key = localStorage.key(i);
        keys.push(key);
    }
    for (var i=0;i<keys.length;i++){
        localStorage.removeItem(keys[i]);
    }
};
