package org.kickjs.editor.servlet;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.datastore.*;
import org.json.JSONException;
import org.json.JSONObject;
import org.kickjs.editor.json.JSONRequest;
import org.kickjs.editor.model.Project;
import org.kickjs.editor.model.Resource;
import org.kickjs.editor.model.User;

import javax.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

public class ResourceRequest extends JSONRequest {
    private DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    private BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
    /**
     * @param jsonRequest
     * @param req
     * @return
     * @throws org.json.JSONException
     */
    protected JSONObject doGet(JSONObject jsonRequest, HttpServletRequest req) throws JSONException {
        String action = jsonRequest.getString("action");
        User user = LoginInfoRequest.getUser(req);
        JSONObject response = new JSONObject();
        if (user == null){
            return new JSONObject("error", "User not logged id");
        } else {
            try{
                String projectName = jsonRequest.getString("projectName");

                if ("list".equals(action)){
                    JSONObject resp = list(projectName, user, req);
                    response.put("response",resp);
                //} else if ("init".equals(action)){
                //    long uid = jsonRequest.getLong("uid");
                //    String contentType = jsonRequest.getString("contentType");
                //    String contentName = jsonRequest.getString("contentName");
                //    JSONObject resp = init(projectName, uid, contentType, contentName, user, req, true);
                //    response.put("response",resp);
                } else if ("update".equals(action)){
                    long uid = jsonRequest.getLong("uid");
                    String contentType = jsonRequest.getString("contentType");
                    String contentName = jsonRequest.getString("contentName");
                    JSONObject resp = init(projectName, uid, contentType, contentName, user, req);
                    response.put("response",resp);
                } else if ("delete".equals(action)){
                    long uid = jsonRequest.getLong("uid");
                    JSONObject resp = delete(projectName,uid,user,req);
                    response.put("response",resp);
                } else {
                    response.put("error","Unknown action "+action);
                }
            } catch (Exception e){
                response.put("error",e.getMessage());
            }
        }
        return response;
    }
    
    private JSONObject list(String projectName, User user, HttpServletRequest req) throws Exception {
        Project project = Project.loadProject(projectName,user,req);
        if (project == null){
            throw new Exception("Not access to project (not exist or user not in ACL)");
        }
        List<JSONObject> resources = new ArrayList<JSONObject>();
        Query query = new Query(Resource.ENTITY_NAME);
        query.setAncestor(project.getKey());
        for (Entity entity : datastore.prepare(query).asIterable()) {
            JSONObject resourceJson = new Resource(entity).toJSON();
            resources.add(resourceJson);
        }
        JSONObject list = new JSONObject();
        list.put("resources",resources);
        return list;
    }

    private JSONObject init(String projectName, long uid, String contentType, String contentName, User user, HttpServletRequest req) throws Exception{
        boolean isNewObject = true; // todo handle both new and existing object uniformly
        Project project = Project.loadProject(projectName,user,req);
        if (project == null){ 
            throw new Exception("Not access to project (not exist or user not in ACL)"); 
        }
        
        Key key = Resource.getKey(project,uid);
        Resource resource;
        try {
            Entity entity = datastore.get(key);
            if (isNewObject){
                if (entity != null){
                    throw new Exception("Resource key already exist '"+project+"' "+uid);
                }
                resource = new Resource(project, uid, contentName, contentType, user.getUserPricipal());
            } else {
                if (entity == null){
                    throw new Exception("Resource did not exist already exist");
                }
                resource = new Resource(entity);
                resource.setModified(new Date());
                resource.setUserPrincipal(user.getUserPricipal());
            }
                
        } catch (EntityNotFoundException e){
            resource = new Resource(project, uid, contentName, contentType, user.getUserPricipal());
        }

        // store upload url as well
        resource.update();
        JSONObject response = resource.toJSON();
        String keyParameter = KeyFactory.keyToString(resource.getKey());
        String url = "/ResourceUpload?key="+ keyParameter;
        response.put("uploadUrl",blobstoreService.createUploadUrl(url));
        return response;
    }

    private JSONObject delete(String projectName, long uid,User user, HttpServletRequest req) throws Exception{
        Project project = Project.loadProject(projectName,user,req);
        if (project == null){
            throw new Exception("Not access to project (not exist or user not in ACL)");
        }
        Key key = Resource.getKey(project,uid);
        boolean deleted = false;
        try {
            Entity entity = datastore.get(key);
            if (entity != null){
                Resource resource = new Resource(entity);
                BlobKey blobKey = resource.getBlobKey();
                if (blobKey != null){
                    blobstoreService.delete();
                }
                deleted = true;
                datastore.delete(key);
            }
        } catch (EntityNotFoundException e){
            // ignore
        }
        JSONObject res = new JSONObject();
        res.put("deleted",deleted);
        return res;
    }
}