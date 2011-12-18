package org.kickjs.editor.model;

import com.google.appengine.api.datastore.*;

import java.io.Serializable;
import java.util.Date;

/**
 * Represent a user on the site
 */
public class User implements Serializable {
    private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    public static final String ENTITY_NAME = "org.kickjs.shared.User";

    private String userPricipal;

    private long loginCount;

    private Date lastLogin;

    public User(String userPricipal) {
        this.userPricipal = userPricipal;
        lastLogin = new Date();
    }

    public User(Entity entity){
        userPricipal = (String)entity.getProperty("userPricipal");
        loginCount = (Long)entity.getProperty("loginCount");
        lastLogin = (Date)entity.getProperty("lastLogin");
    }

    public Entity createEntity(){
        Entity entity = new Entity(ENTITY_NAME, userPricipal);
        entity.setProperty("userPricipal",userPricipal);
        entity.setProperty("loginCount",loginCount);
        entity.setProperty("lastLogin",lastLogin);
        return entity;
    }

    public static Key getKey(String userPricipal){
        return KeyFactory.createKey(ENTITY_NAME, userPricipal);
    }

    public long getLoginCount() {
        return loginCount;
    }

    public void setLoginCount(int loginCount) {
        this.loginCount = loginCount;
    }

    public Date getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(Date lastLogin) {
        this.lastLogin = lastLogin;
    }

    public void increamentLoginCount(){
        loginCount++;
    }

    public String getUserPricipal() {
        return userPricipal;
    }

    public void setUserPricipal(String userPricipal) {
        this.userPricipal = userPricipal;
    }

    public void update(){
        datastore.put(createEntity());
    }
}
