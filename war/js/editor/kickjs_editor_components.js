"use strict";
/**
 * VisualGrid
 * @class VisualGrid
 * @constructor
 */
var VisualGrid = function VisualGrid(){ // use explicit function name to support auto serialization
    var engine,
        gl,
        gridShader,
        gridMesh,
        shaderMaterial,
        transform,
        thisObj = this;

    this.enabled = true;

    this.activated = function(){
        engine = this.gameObject.engine;
        transform = this.gameObject.transform;
        gl = engine.gl;
        gridShader = engine.project.load(engine.project.ENGINE_SHADER_UNLIT);
        shaderMaterial = engine.project.loadByName("__Grid__");
        if (!shaderMaterial){
            shaderMaterial = new KICK.material.Material(engine,{
                name:"__Grid__",
                shader: gridShader,
                uniforms:{
                    mainColor: {
                        value: [.2,.2,.2,1.0],
                        type: KICK.core.Constants.GL_FLOAT_VEC3
                    },
                    mainTexture: {
                        value: engine.project.load(engine.project.ENGINE_TEXTURE_WHITE),
                        type: KICK.core.Constants.GL_SAMPLER_2D
                    }
                }
            });
        }
        var gridMeshData = new KICK.mesh.MeshData();
        var lines = [];
        var index = [];
        var uvs = [];
        var size = 100;
        for (var i=-size;i<=size;i++){
            // one direction - from
            lines.push(-size);
            lines.push(0);
            lines.push(i);
            // one direction - to
            lines.push(size);
            lines.push(0);
            lines.push(i);
            // one direction - from
            lines.push(i);
            lines.push(0);
            lines.push(-size);
            // one direction - to
            lines.push(i);
            lines.push(0);
            lines.push(size);
            // update indices
            index.push(index.length);
            index.push(index.length);
            index.push(index.length);
            index.push(index.length);
            for (var x=0;x<8;x++){
                uvs.push(0);
            }
        }
        gridMeshData.meshType = KICK.core.Constants.GL_LINES;
        gridMeshData.vertex = lines;
        gridMeshData.indices = index;
        gridMeshData.uv1 = uvs;

        gridMesh = engine.project.loadByName("__GridLines");
        if (!gridMesh){
            gridMesh = new KICK.mesh.Mesh(engine,{
                name:"__GridLines",
                meshData:gridMeshData
            });
        } else {
            gridMesh.meshData = gridMeshData;
        }
        var errors = gridMesh.verify(gridShader);
        if (errors){
           console.log(errors);
        }
    };
    this.render = function(engineUniforms,overwriteShader){
        if (thisObj.enabled){
            var shader = overwriteShader || gridShader;
            gridMesh.bind(shader);
            shader.bindUniform(shaderMaterial,engineUniforms,transform);
            gridMesh.render(0);
        }
    };
};

var CameraNavigator = function CameraNavigator(){ // use explicit function name to support auto serialization
    var transform,
        mouseInput,
        euler = KICK.math.vec3.create(),
        camera;
    this.activated = function(){
        var gameObject = this.gameObject;
        transform = gameObject.transform;
        mouseInput = gameObject.engine.mouseInput;
        mouseInput.mouseWheelPreventDefaultAction = true;
        camera = gameObject.getComponentOfType(KICK.scene.Camera);
    };

    this.update = function(){
        var mousePosDelta,
            hasMovement,
            rotation,
            pos;
        if (mouseInput.isButtonDown(0)){
            var componentsPicked = function (gameObject){
                if (gameObject.destUid){
                    sceneEditorApp.gameObjectSelected(gameObject.destUid);
                }
            };
            var x = mouseInput.mousePosition[0];
            var y = mouseInput.mousePosition[1];
            camera.pick(componentsPicked,x,y);
        }

        if (mouseInput.isButton(2)){
            mousePosDelta = mouseInput.deltaMovement;
            hasMovement = mousePosDelta[0] || mousePosDelta[1];
            if (hasMovement){
                var mouseSensitivity = 0.1;
                euler[0] += mousePosDelta[1]*mouseSensitivity;
                euler[1] += mousePosDelta[0]*mouseSensitivity;
                transform.localRotationEuler = euler;
            }
        } else if (mouseInput.isButton(1)){
            mousePosDelta = mouseInput.deltaMovement;
            hasMovement = mousePosDelta[0] || mousePosDelta[1];
            if (hasMovement){
                var mousePanSensitivity = 0.01;
                var movement = [-mousePanSensitivity*mousePosDelta[0],mousePanSensitivity*mousePosDelta[1],0];
                rotation = transform.rotation;
                movement = KICK.math.quat4.multiplyVec3(rotation,movement);
                pos = transform.position;
                pos = KICK.math.vec3.add(pos,movement);
                transform.position = pos;
            }
        }
        var wheelDelta = mouseInput.deltaWheel;
        if (wheelDelta[1]){
            console.log(wheelDelta[1]);
            var mouseScrollWheelSensitivity = 0.01;
            var forward = [0,0,-mouseScrollWheelSensitivity*wheelDelta[1]];
            rotation = transform.rotation;
            forward = KICK.math.quat4.multiplyVec3(rotation,forward);
            pos = transform.position;
            pos = KICK.math.vec3.add(pos,forward);
            transform.position = pos;
        }
    };
};