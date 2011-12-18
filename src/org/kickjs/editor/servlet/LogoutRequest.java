package org.kickjs.editor.servlet;


import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

public class LogoutRequest extends HttpServlet{
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String thisURL = req.getParameter("url");
        if (thisURL == null){
            thisURL = "/";
        }
        UserService userService = UserServiceFactory.getUserService();
        HttpSession session = req.getSession();
        session.invalidate();
        resp.sendRedirect(userService.createLogoutURL(thisURL));
    }
}
