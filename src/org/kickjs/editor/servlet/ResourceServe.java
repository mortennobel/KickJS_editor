package org.kickjs.editor.servlet;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.datastore.*;
import org.json.JSONObject;
import org.kickjs.editor.model.Project;
import org.kickjs.editor.model.Resource;
import org.kickjs.editor.model.User;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ResourceServe extends HttpServlet {
    private static BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
    private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User user = LoginInfoRequest.getUser(req);
        if (user == null){
            throw new ServletException("User not logged on");
        }
        
        int offset = "/project/".length();
        String url = req.getRequestURI().substring(offset);
        int delimiterIndex = url.indexOf("/");
        if (delimiterIndex==-1){
            throw new ServletException("Invalid url");
        }
        String projectName = url.substring(0, delimiterIndex);
        String uidStr = url.substring(delimiterIndex+1);
        if (uidStr.length()==0){
            throw new ServletException("Invalid url");
        }
        long uid = Long.parseLong(uidStr);

        Project project = Project.loadProject(projectName,user,req);

        Key key = Resource.getKey(project, uid);
        try {
            Entity entity = datastore.get(key);
            Resource resource = new Resource(entity);
            BlobKey blobKey = resource.getBlobKey();
            resp.setContentType(resource.getContentType());
            blobstoreService.serve(blobKey, resp);
        } catch (EntityNotFoundException e) {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }
}
