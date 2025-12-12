package ec.mil.dsndft.servicio_catalogos.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.mil.dsndft.servicio_catalogos.model.ApiError;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        ApiError err = new ApiError();
        err.status = HttpServletResponse.SC_UNAUTHORIZED;
        err.error = "Unauthorized";
        err.message = authException != null && authException.getMessage() != null ? authException.getMessage() : "No autorizado";
        err.path = request.getRequestURI();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        mapper.writeValue(response.getWriter(), err);
    }
}
