package org.kickjs.editor.servlet;


import com.google.appengine.api.datastore.*;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.kickjs.editor.json.JSONRequest;
import org.kickjs.editor.model.User;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.security.Principal;
import java.util.Date;

public class LoginInfoRequest extends JSONRequest {
    /**
     * Attemps to login a user. Is success the following object is returned {logoutURL:xxx,loginCount:yyy,username:zzz}
     * <br/>
     * If not logged in the following url is returned: {loginURL:xxx}
     * @param jsonRequest {url:urlOfRedirectWhenLogin}. Note that url is optional
     * @param req
     * @return
     * @throws JSONException
     */
    protected JSONObject doGet(JSONObject jsonRequest, HttpServletRequest req) throws JSONException {
        JSONObject response = new JSONObject();

        String thisURL = req.getRequestURI();

        if (jsonRequest.has("url")){
            thisURL = jsonRequest.getString("url");
        }
        UserService userService = UserServiceFactory.getUserService();
        User user = getUser(req);
        if (user==null){
            response.put("loginURL",userService.createLoginURL(thisURL));
        } else {
            try {
                response.put("logoutURL","/Logout?url="+ URLEncoder.encode(thisURL,"UTF-8"));
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }
            response.put("loginCount",user.getLoginCount());
            response.put("username",user.getUserPricipal());
        }
        return response;
    }

    public static User getUser(HttpServletRequest req){
        HttpSession session = req.getSession();
        User user = (User) session.getAttribute("user");
        if (user != null){
            return user;
        }
        Principal userPrincipal = req.getUserPrincipal();
        if (userPrincipal == null){
            return null;
        }
        String userPrincipalName = userPrincipal.getName();
        Key key = KeyFactory.createKey(User.ENTITY_NAME,userPrincipalName);
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        try {
            Entity entity = datastore.get(key);
            if (entity != null){
                user = new User(entity);
            }
        } catch (EntityNotFoundException e){
            // ignore
        }
        if (user == null){
            user = new User(userPrincipalName);
        } else {
            user.setLastLogin(new Date());
            user.increamentLoginCount();
        }
        datastore.put(user.createEntity());
        session.setAttribute("user",user);
        return user;
    }

}
