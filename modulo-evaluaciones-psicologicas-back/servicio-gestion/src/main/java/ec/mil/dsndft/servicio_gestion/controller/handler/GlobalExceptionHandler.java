package ec.mil.dsndft.servicio_gestion.controller.handler;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleEntityNotFound(EntityNotFoundException ex, HttpServletRequest request) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest request) {
        String path = request != null ? request.getRequestURI() : "";
        log.error("Unexpected error on {}", path, ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Ha ocurrido un error inesperado", request);
    }

    private ResponseEntity<ApiError> buildError(HttpStatus status, String message, HttpServletRequest request) {
        String path = request != null ? request.getRequestURI() : null;
        ApiError body = ApiError.of(status.value(), status.getReasonPhrase(), message, path);
        return ResponseEntity.status(status).body(body);
    }
}
