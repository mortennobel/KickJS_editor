package org.kickjs.editor.servlet;

import org.json.JSONException;
import org.json.JSONObject;
import org.kickjs.editor.json.JSONRequest;
import org.kickjs.editor.model.Project;
import org.kickjs.editor.model.User;
import org.kickjs.editor.model.UserProjectRole;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.List;

public class ProjectRequest extends JSONRequest{
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
            response.put("error", "User not logged id");
        } else {
            if ("list".equals(action)){
                response.put("response",list(user));
            } else if ("load".equals(action)){
                String name = jsonRequest.getString("name");
                response.put("response",load(name, user,req));
            } else if ("isNameValid".equals(action)){
                String name = jsonRequest.getString("name");
                response.put("response",isNameValid(name));
            } else if ("create".equals(action)){
                String name = jsonRequest.getString("name");
                response.put("response",create(name,user));
            } else if ("delete".equals(action)){
                String name = jsonRequest.getString("name");
                response.put("response", delete(name, user));
            } else {
                response.put("error", "User not logged id");
            }
        }

        return response;
    }

    private JSONObject create(String name, User user) throws JSONException {
        if (!isNameValid(name).getBoolean("nameValid")){
            return new JSONObject("error", "Invalid name");
        }
        Project project = new Project(name);
        project.update();
        UserProjectRole projectOwner = new UserProjectRole(project,user);
        projectOwner.update();
        return project.toJSON();
    }

    private JSONObject delete(String name, User user) throws JSONException {
        Project project = new Project(name);
        if (project.hasUserWriteAccess(user)){
            project.setDeleted(true);
            project.update();
        }
        return project.toJSON();
    }

    private JSONObject isNameValid(String name) throws JSONException {
        boolean valid = Project.isNameValid(name);
        JSONObject res = new JSONObject();
        res.put("nameValid",valid);
        return res;
    }

    private JSONObject load(String projectName, User user, HttpServletRequest req) throws JSONException{
        Project project = Project.loadProject(projectName,user,req);
        if (project == null){
            return new JSONObject("error", "Cannot load project (not found or not access to project)");
        }
        return project.toJSON();
    }

    private JSONObject list(User user) throws JSONException{
        List<String> projects = Project.getProjectNames(user);
        JSONObject res = new JSONObject();
        res.put("projects",projects);
        return res;
    }
}
