package org.kickjs.editor.json;

import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;

public abstract class JSONRequest extends HttpServlet {
    /**
     * Handles a JSON request (HTTP GET request where the url parameters are treated as key-value pair in a JSON object).
     * @param jsonRequest
     * @param req
     * @return JSON object (Will be serialized to http response)
     * @throws JSONException
     */
    protected JSONObject doGet(JSONObject jsonRequest, HttpServletRequest req) throws JSONException {
        // default implementation
        return new JSONObject();
    }

    /**
     * Handles a JSON request (HTTP POST request where the a JSON object is serialized request body).
     * @param jsonRequest
     * @param req
     * @return JSON object (Will be serialized to http response)
     * @throws JSONException
     */
    protected JSONObject doPost(JSONObject jsonRequest, HttpServletRequest req) throws JSONException {
        // default implementation
        return new JSONObject();
    }

    protected final void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        JSONObject jsonRequest = new JSONObject();

        Enumeration parameterNames = req.getParameterNames();
        while (parameterNames.hasMoreElements()){
            String parameterName = parameterNames.nextElement().toString();
            String value = req.getParameter(parameterName);
            try {
                jsonRequest.put(parameterName, value);
            } catch (Exception e) {
                log("Error putting JSON data", e);
                throw new ServletException(e);
            }
        }
        try {
            JSONObject jsonResponse = doGet(jsonRequest,req);
            resp.setContentType("application/json; charset=UTF-8");
            resp.setCharacterEncoding("UTF-8");
            PrintWriter out = resp.getWriter();
            out.print(jsonResponse.toString());
        } catch (Exception e) {
            log("Error in doGet", e);
            throw new ServletException(e);
        }
    }

    protected final void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        BufferedReader br = req.getReader();
        StringBuilder sb = new StringBuilder();
        String line = br.readLine();
        while (line != null){
            sb.append(line);
            sb.append("\n");
            line = br.readLine();
        }
        JSONObject jsonRequest;
        try{
            jsonRequest = new JSONObject(sb.toString());
        } catch (Exception e){
            log("Error reason JSON request data", e);
            throw new ServletException(e);
        }
        try{
            JSONObject jsonResponse = doPost(jsonRequest,req);
            resp.setContentType("application/json; charset=UTF-8");
            resp.setCharacterEncoding("UTF-8");
            PrintWriter out = resp.getWriter();
            out.print(jsonResponse.toString());
        } catch (Exception e){
            log("Error in doPost", e);
            throw new ServletException(e);
        }
    }
}
