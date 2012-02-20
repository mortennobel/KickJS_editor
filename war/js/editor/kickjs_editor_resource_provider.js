"use strict";
var KICKED = KICKED || {};

var BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;
var URL = window.webkitURL || window.URL;


/**
 * Fall back handler of resources
 * @class LocalStorageResourceProvider
 * @namespace KICKED
 * @constructor
 * @extends KICK.core.ResourceProvider
 * @param {KICK.core.Engine} engine
 * @private
 */
KICKED.LocalStorageResourceProvider = function(engine){
    var gl = engine.gl,
        thisObj = this;
    Object.defineProperties(this,{
        /**
         * Returns empty string (match all)
         * @property protocol
         * @type String
         */
        protocol:{
            value:"localStorage://"
        }
    });

    /**
     * @method getMeshData
     * @param url
     * @param meshDestination
     */
    this.getMeshData = function(url,meshDestination){
        var urlContent = url.substring(thisObj.protocol.length).split("/"),
            projectName = urlContent[0],
            uid = parseInt(urlContent[1]);
        var onSuccess = function(res){
            var meshData = new KICK.mesh.MeshData();
            if (meshData.deserialize(res)){
                meshDestination.meshData = meshData;
            } else {
                console.log("Cannot deserialize mesh data "+url);
            }
            console.log(res);
        };
        var onError = function(res){
            console.log("Error",res);
        };
        KICKED.localStorage.resource.load(projectName,uid,onSuccess,onError);

    };

    var isPNG = function(arrayBuffer){
        var uInt8 = new Uint8Array(arrayBuffer);
        return uInt8.length>10 &&
            uInt8[0] === 137 &&
            uInt8[1] === 80 &&
            uInt8[2] === 78 &&
            uInt8[3] === 71 &&
            uInt8[4] === 13 &&
            uInt8[5] === 10 &&
            uInt8[6] === 26 &&
            uInt8[7] === 10;
    };

    /**
     * @method getImageData
     * @param {String} url
     * @param {Object} textureDestination
     */
    this.getImageData = function(url,textureDestination){
        var urlContent = url.substring(thisObj.protocol.length).split("/"),
            projectName = urlContent[0],
            uid = parseInt(urlContent[1]);
        var onSuccess = function(res){
            var bb = new BlobBuilder();
            bb.append(res);

            var type = isPNG(res)?"image/png":"image/jpeg";
            console.log("Loading "+type+" image of size "+res.byteLength);
            var blob = bb.getBlob(type);
            var img = document.createElement('img');
            img.onload = function(e) {
                textureDestination.setImage(img,url);
                URL.revokeObjectURL(img.src); // Clean up
            };
            img.onerror = function(e){
                console.log("error get image data");
                console.log(e);
            };
            img.src = URL.createObjectURL(blob);
        };
        var onError = function(res){
            console.log("Error",res);
        };
        KICKED.localStorage.resource.load(projectName,uid,onSuccess,onError);
    };


    /**
     * @method getShaderData
     * @param {String} uri
     * @param {} shaderDestination
     */
    this.getShaderData = function( uri , shaderDestination ){
        KICK.core.Util.fail("Not implemented yet 2");
    };
};
