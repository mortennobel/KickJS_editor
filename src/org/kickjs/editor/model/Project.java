package org.kickjs.editor.model;

import com.google.appengine.api.datastore.*;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 *
 */
public class Project  implements Serializable {
    private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    public static final String ENTITY_NAME = "org.kickjs.shared.Project";
    private static Pattern namePattern = Pattern.compile("[0-9a-zA-z_\\-]*");
    
    public final String name; // key
    public Date created;
    public boolean deleted;
    
    private List<UserProjectRole> roles;

    public static List<String> getProjectNames(User user){
        Query userQ = new Query(UserProjectRole.ENTITY_NAME);
        userQ.addFilter("user", Query.FilterOperator.EQUAL, user.getUserPricipal());
        PreparedQuery pq = datastore.prepare(userQ);
        List<String> res = new ArrayList<String>();
        for (Entity result : pq.asIterable()) {
            UserProjectRole userProjectRole = new UserProjectRole(result);
            res.add(userProjectRole.getProject());
        }
        return res;
    }

    /**
     * Check validity for a project name:
     * 1. Test that name length is less than 255
     * 2. Test that name is not used
     * 3. Test that only legal characters is used ([0-9a-zA-z_-]*)
     */
    public static boolean isNameValid(String name){
        if (name.length()>255){
            return false;
        }
        try {
            Entity entity = datastore.get(getKey(name));
            if (entity != null){
                return false;
            }
        } catch (EntityNotFoundException e){
            // ignore
        }

        Matcher m = namePattern.matcher(name);
        return m.matches();
    }

    public static Project loadProject(String name, User user, HttpServletRequest req){
        HttpSession session = req.getSession();
        Project cachedProject = (Project) session.getAttribute("currentProject");
        if (cachedProject != null){
            return cachedProject; 
        }
        Query userQ = new Query(UserProjectRole.ENTITY_NAME);
        userQ.addFilter("user", Query.FilterOperator.EQUAL, user.getUserPricipal());
        userQ.addFilter("project", Query.FilterOperator.EQUAL, name);
        PreparedQuery pq = datastore.prepare(userQ);
        if (pq.asIterable().iterator().hasNext()){
            try {
                Entity entity = datastore.get(getKey(name));
                if (entity != null){
                    Project project = new Project(entity);
                    session.setAttribute("currentProject",project);
                    return project;
                }
            } catch (EntityNotFoundException e){
                // ignore
            }
        }
        return null;
    }

    public List<UserProjectRole> getRoles() {
        if (roles == null){
            Query userQ = new Query(UserProjectRole.ENTITY_NAME);
            userQ.addFilter("project", Query.FilterOperator.EQUAL, name);
            PreparedQuery pq = datastore.prepare(userQ);
            List<UserProjectRole> res = new ArrayList<UserProjectRole>();
            for (Entity result : pq.asIterable()) {
                res.add(new UserProjectRole(result));
            }
            roles = res;
        }
        return roles;
    }

    public void update(){
        datastore.put(createEntity());
    }

    public Project(String name) {
        this.name = name;
        created = new Date();
    }

    public Project(Entity entity){
        name = (String)entity.getProperty("name");
        created = (Date)entity.getProperty("created");
        deleted = (Boolean)entity.getProperty("deleted");
    }
    
    public boolean hasUserWriteAccess(User user){
        return true;
    }

    public boolean hasUserReadAccess(User user){
        return true;
    }

    public Entity createEntity(){
        Entity entity = new Entity(getKey());
        entity.setProperty("created",created);
        entity.setProperty("name",name);
        entity.setProperty("deleted",deleted);
        return entity;
    }
    
    public Key getKey(){
        return KeyFactory.createKey(ENTITY_NAME, name);
    }

    public static Key getKey(String name){
        return KeyFactory.createKey(ENTITY_NAME, name);
    }

    public String getName() {
        return name;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public JSONObject toJSON(){
        JSONObject res = new JSONObject();
        try {
            res.put("name",name);
            res.put("created",created);
            res.put("deleted",deleted);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return res;
    }
}
