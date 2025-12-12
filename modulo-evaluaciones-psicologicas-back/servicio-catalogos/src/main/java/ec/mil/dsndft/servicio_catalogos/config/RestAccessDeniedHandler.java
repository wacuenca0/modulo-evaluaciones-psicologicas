package ec.mil.dsndft.servicio_catalogos.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.mil.dsndft.servicio_catalogos.model.ApiError;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        ApiError err = new ApiError();
        err.status = HttpServletResponse.SC_FORBIDDEN;
        err.error = "Forbidden";
        err.message = accessDeniedException.getMessage();
        err.path = request.getRequestURI();
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        mapper.writeValue(response.getWriter(), err);
    }
}
