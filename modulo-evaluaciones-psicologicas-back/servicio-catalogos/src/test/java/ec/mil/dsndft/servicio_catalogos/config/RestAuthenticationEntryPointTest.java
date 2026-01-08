package ec.mil.dsndft.servicio_catalogos.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import ec.mil.dsndft.servicio_catalogos.model.ApiError;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;

import static org.assertj.core.api.Assertions.assertThat;

class RestAuthenticationEntryPointTest {

    private final ObjectMapper mapper = Jackson2ObjectMapperBuilder.json()
        .modulesToInstall(JavaTimeModule.class)
        .build();

    @Test
    void shouldWriteUnauthorizedErrorWithTimestamp() throws Exception {
        RestAuthenticationEntryPoint entryPoint = new RestAuthenticationEntryPoint(mapper);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/protected");
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(request, response, new BadCredentialsException("Invalid token"));

        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);
        ApiError error = mapper.readValue(response.getContentAsString(), ApiError.class);
        assertThat(error.timestamp).isNotNull();
        assertThat(error.status).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);
        assertThat(error.error).isEqualTo("Unauthorized");
        assertThat(error.message).contains("Invalid token");
        assertThat(error.path).isEqualTo("/api/protected");
    }
}
