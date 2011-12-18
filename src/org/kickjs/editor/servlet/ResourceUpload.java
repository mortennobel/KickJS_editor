package org.kickjs.editor.servlet;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.datastore.*;
import org.kickjs.editor.model.Project;
import org.kickjs.editor.model.Resource;
import org.kickjs.editor.model.User;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;

public class ResourceUpload extends HttpServlet {
    private static BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
    private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    public void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        Map<String, List<BlobKey>> blobs = blobstoreService.getUploads(req);
        List<BlobKey> blobKeys = blobs.get("uploadFile");
        if (!blobKeys.isEmpty()){
            User user = LoginInfoRequest.getUser(req);
            String keyStr = req.getParameter("key");
            Key key = KeyFactory.stringToKey(keyStr);
            Resource resource;
            try {
                Entity entity = datastore.get(key);
                if (entity == null){
                    throw new ServletException("Resource not found");
                }
                resource = new Resource(entity);
                if (!resource.getUserPrincipal().equals(user.getUserPricipal())){
                    throw new ServletException("Invalid user. Was "+user.getUserPricipal()+" expected "+resource.getUserPrincipal());
                }
                BlobKey currentBlobKey = resource.getBlobKey(); 
                if (currentBlobKey!=null){
                    blobstoreService.delete(currentBlobKey);
                }
            } catch (EntityNotFoundException e){
                // ignore
                throw new ServletException("Resource not found");
            }
            resource.setBlobKey(blobKeys.get(0));
            resource.update();
        }
        // if multiple upload then delete all the extra unreferenced uploads
        for (int i=1;i<blobKeys.size();i++){
            blobstoreService.delete(blobKeys.get(i));
        }
    }
}
