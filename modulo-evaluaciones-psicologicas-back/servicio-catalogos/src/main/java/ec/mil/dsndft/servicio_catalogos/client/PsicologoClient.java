package ec.mil.dsndft.servicio_catalogos.client;

import ec.mil.dsndft.servicio_catalogos.model.integration.PsicologoCreateRequest;
import ec.mil.dsndft.servicio_catalogos.model.integration.PsicologoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class PsicologoClient {

    private static final Logger log = LoggerFactory.getLogger(PsicologoClient.class);

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public PsicologoClient(RestTemplate restTemplate,
                           @Value("${services.gestion.base-url:http://127.0.0.1:8082}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public PsicologoResponse crearPsicologo(PsicologoCreateRequest request) {
        String url = baseUrl + "/api/psicologos";
        try {
            HttpHeaders headers = buildHeadersWithAuth();
            HttpEntity<PsicologoCreateRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<PsicologoResponse> response = restTemplate.postForEntity(url, entity, PsicologoResponse.class);
            PsicologoResponse body = response.getBody();
            if (body == null) {
                log.warn("El servicio de gestión devolvió una respuesta vacía al crear el psicólogo para el usuario {}", request.getUsername());
            }
            return body;
        } catch (RestClientException ex) {
            log.error("Error al invocar {} para crear psicólogo", url, ex);
            throw ex;
        }
    }

    private HttpHeaders buildHeadersWithAuth() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes servletAttributes) {
            String authorizationHeader = servletAttributes.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
            if (authorizationHeader != null && !authorizationHeader.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);
            } else {
                log.warn("Solicitud sin encabezado Authorization al intentar propagar token hacia servicio de gestión");
            }
        } else {
            log.warn("No se pudo acceder al request actual para propagar credenciales hacia servicio de gestión");
        }

        return headers;
    }
}
