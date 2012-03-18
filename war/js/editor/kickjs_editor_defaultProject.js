window.kickjsDefaultProject = {
   "engineVersion": "0.3.2",
   "maxUID": 28,
   "activeScene": 1,
   "resourceDescriptors": [
      {
         "type": "KICK.scene.Scene",
         "uid": 1,
         "config": {
            "uid": 1,
            "gameObjects": [
               {
                  "name": "Triangle",
                  "layer": 1,
                  "uid": 10,
                  "components": [
                     {
                        "type": "KICK.scene.Transform",
                        "uid": 18,
                        "config": {
                           "localPosition": [
                              -2,
                              0,
                              0
                           ],
                           "localRotation": [
                              0,
                              0,
                              0,
                              1
                           ],
                           "localScale": [
                              1,
                              1,
                              1
                           ],
                           "parent": null
                        }
                     },
                     {
                        "type": "KICK.scene.MeshRenderer",
                        "uid": 11,
                        "config": {
                           "materials": [
                              {
                                 "ref": 8,
                                 "name": "White material",
                                 "reftype": "project"
                              }
                           ],
                           "mesh": {
                              "ref": -300,
                              "name": "Triangle",
                              "reftype": "project"
                           },
                           "uid": 11,
                           "scriptPriority": 0
                        }
                     }
                  ]
               },
               {
                  "name": "Cube",
                  "layer": 1,
                  "uid": 12,
                  "components": [
                     {
                        "type": "KICK.scene.Transform",
                        "uid": 19,
                        "config": {
                           "localPosition": [
                              2,
                              0,
                              0
                           ],
                           "localRotation": [
                              0,
                              0,
                              0,
                              1
                           ],
                           "localScale": [
                              1,
                              1,
                              1
                           ],
                           "parent": null
                        }
                     },
                     {
                        "type": "KICK.scene.MeshRenderer",
                        "uid": 13,
                        "config": {
                           "materials": [
                              {
                                 "ref": 9,
                                 "name": "Gray material",
                                 "reftype": "project"
                              }
                           ],
                           "mesh": {
                              "ref": -303,
                              "name": "Cube",
                              "reftype": "project"
                           },
                           "uid": 13,
                           "scriptPriority": 0
                        }
                     }
                  ]
               },
               {
                  "name": "Camera",
                  "layer": 1,
                  "uid": 14,
                  "components": [
                     {
                        "type": "KICK.scene.Transform",
                        "uid": 20,
                        "config": {
                           "localPosition": [
                              0,
                              1,
                              10
                           ],
                           "localRotation": [
                              0,
                              0,
                              0,
                              1
                           ],
                           "localScale": [
                              1,
                              1,
                              1
                           ],
                           "parent": null
                        }
                     },
                     {
                        "type": "KICK.scene.Camera",
                        "uid": 15,
                        "config": {
                           "enabled": true,
                           "renderShadow": false,
                           "renderer": "KICK.renderer.ForwardRenderer",
                           "layerMask": 4294967295,
                           "renderTarget": null,
                           "fieldOfView": 60,
                           "near": 0.1,
                           "far": 1000,
                           "perspective": true,
                           "left": -1,
                           "right": 1,
                           "bottom": -1,
                           "top": 1,
                           "cameraIndex": 1,
                           "clearColor": [
                              0,
                              0,
                              0,
                              1
                           ],
                           "clearFlagColor": true,
                           "clearFlagDepth": true,
                           "normalizedViewportRect": [
                              0,
                              0,
                              1,
                              1
                           ]
                        }
                     }
                  ]
               }
            ],
            "name": "Scene"
         }
      },
      {
         "type": "KICK.material.Material",
         "uid": 8,
         "config": {
            "uid": 8,
            "name": "White material",
            "shader": {
               "ref": -102,
               "name": "Unlit",
               "reftype": "project"
            },
            "uniforms": {
               "mainColor": {
                  "type": 35665,
                  "value": [
                     1,
                     1,
                     1,
                     1
                  ]
               },
               "mainTexture": {
                  "type": 35678,
                  "value": {
                     "ref": -201,
                     "name": "White",
                     "reftype": "project"
                  }
               }
            }
         }
      },
      {
         "type": "KICK.material.Material",
         "uid": 9,
         "config": {
            "uid": 9,
            "name": "Gray material",
            "shader": {
               "ref": -102,
               "name": "Unlit",
               "reftype": "project"
            },
            "uniforms": {
               "mainColor": {
                  "type": 35665,
                  "value": [
                     1,
                     1,
                     1,
                     1
                  ]
               },
               "mainTexture": {
                  "type": 35678,
                  "value": {
                     "ref": -202,
                     "name": "Gray",
                     "reftype": "project"
                  }
               }
            }
         }
      }
   ]
}