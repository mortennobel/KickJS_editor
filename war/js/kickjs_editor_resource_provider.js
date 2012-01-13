var KICKED = KICKED || {};

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
        var onError = function(){
            console.log("Error",res);
        };
        KICKED.localStorage.resource.load(projectName,uid,onSuccess,onError);

    };

    this.getImageData = function(uri,textureDestination){
        var img = new Image();
        img.onload = function(){
            try{
                textureDestination.setImage(img,uri);
            } catch (e){
                fail("Exception when loading image "+uri);
            }
        };
        img.onerror = function(e){
            fail(e);
            fail("Exception when loading image "+uri);
        };
        img.crossOrigin = "anonymous"; // Ask for a CORS image
        img.src = uri;
    };


    this.getShaderData = function( uri , shaderDestination ){
        fail("Not implemented yet 2");
    };
};
