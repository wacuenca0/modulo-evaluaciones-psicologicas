package ec.mil.dsndft.servicio_catalogos.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    public Instant timestamp = Instant.now();
    public int status;
    public String error;
    public String message;
    public String path;
    public List<FieldError> errors;

    public static class FieldError {
        public String field;
        public String message;

        public FieldError(String field, String message) {
            this.field = field;
            this.message = message;
        }
    }
}
