package org.kickjs.editor.model;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.datastore.*;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;
import java.util.Date;

public class Resource implements Serializable {
    private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    public static final String ENTITY_NAME = "org.kickjs.shared.Resource";
    private Key key;
    private long uid;
    private String project;
    private String name;
    private String contentType;
    private String userPrincipal;
    private Date created;
    private Date modified;
    private String blobKey;

    public static Key getKey(Project project, long id){
        return KeyFactory.createKey(project.getKey(),ENTITY_NAME,id);
    }
    
    public Resource(Project project, long uid,String name,String contentType,String userPrincipal){
        key = getKey(project, uid);
        this.project = project.getName();
        this.uid = uid;
        this.name = name;
        this.contentType = contentType;
        this.userPrincipal = userPrincipal;
        this.created = new Date();
        this.modified = new Date();
    }

    public Resource(Entity entity){
        key = entity.getKey();
        uid = (Long)entity.getProperty("uid");
        project = (String)entity.getProperty("project");
        name = (String)entity.getProperty("name");
        contentType = (String)entity.getProperty("contentType");
        userPrincipal = (String)entity.getProperty("userPrincipal");
        created = (Date)entity.getProperty("created");
        modified = (Date)entity.getProperty("modified");
        blobKey = (String) entity.getProperty("blobKey");
    }

    public Entity createEntity(){
        Entity entity = new Entity(key);
        entity.setProperty("uid", uid);
        entity.setProperty("project", project);
        entity.setProperty("name", name);
        entity.setProperty("contentType", contentType);
        entity.setProperty("userPrincipal", userPrincipal);
        entity.setProperty("created", created);
        entity.setProperty("modified", modified);
        entity.setProperty("blobKey", blobKey);
        return entity;
    }

    public void update(){
        Entity e = createEntity();
        datastore.put(e);
        key = e.getKey();
    }

    public JSONObject toJSON() throws JSONException {
        JSONObject res = new JSONObject();
        res.put("uid", uid);
        res.put("project", project);
        res.put("name", name);
        res.put("contentType", contentType);
        res.put("userPrincipal", userPrincipal);
        res.put("created", created);
        res.put("modified", modified);
        return res;
    }

    public long getUid() {
        return uid;
    }

    public void setUid(long uid) {
        this.uid = uid;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getUserPrincipal() {
        return userPrincipal;
    }

    public void setUserPrincipal(String userPrincipal) {
        this.userPrincipal = userPrincipal;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public Date getModified() {
        return modified;
    }

    public void setModified(Date modified) {
        this.modified = modified;
    }

    public BlobKey getBlobKey() {
        if (blobKey == null){
            return null;
        }
        return new BlobKey(blobKey) ;
    }

    public void setBlobKey(BlobKey blobKey) {
        this.blobKey = blobKey.getKeyString();
    }

    public Key getKey() {
        return key;
    }
    
    public String getUrl(){
        return "/project/"+project+"/"+uid+"#"+name;
    }
}
