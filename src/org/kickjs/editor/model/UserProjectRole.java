package org.kickjs.editor.model;

import com.google.appengine.api.datastore.*;

import java.io.Serializable;
import java.util.Date;

/**
 * Models the relationship between a User and a Project
 */
public class UserProjectRole implements Serializable {
    private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    public static final String ENTITY_NAME = "org.kickjs.shared.UserProjectRole";

    private Key key;
    private String project;
    private String user;

    private boolean readAccess;
    private boolean writeAccess;

    public UserProjectRole(Project project, User user) {
        KeyRange keyRange = datastore.allocateIds(project.getKey(), ENTITY_NAME,1);
        key = keyRange.getStart();
        this.project = project.getName();
        this.user = user.getUserPricipal();
        readAccess = true;
        writeAccess = true;
    }

    public UserProjectRole(Entity entity){
        key = entity.getKey();
        project = (String)entity.getProperty("project");
        user = (String)entity.getProperty("user");
        readAccess = (Boolean)entity.getProperty("readAccess");
        writeAccess = (Boolean)entity.getProperty("writeAccess");
    }

    public Entity createEntity(){
        Entity entity = new Entity(key);
        entity.setProperty("project",project);
        entity.setProperty("user",user);
        entity.setProperty("readAccess",readAccess);
        entity.setProperty("writeAccess",writeAccess);
        return entity;
    }

    public void update(){
        datastore.put(createEntity());
    }

    public Key getKey() {
        return key;
    }

    public void setKey(Key key) {
        this.key = key;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }
}
