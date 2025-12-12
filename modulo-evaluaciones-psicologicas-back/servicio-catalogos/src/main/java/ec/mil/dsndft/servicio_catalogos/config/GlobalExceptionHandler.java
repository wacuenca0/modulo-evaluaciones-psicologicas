package ec.mil.dsndft.servicio_catalogos.config;

import ec.mil.dsndft.servicio_catalogos.model.ApiError;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<ApiError> build(HttpStatus status, String message, String path) {
        ApiError err = new ApiError();
        err.status = status.value();
        err.error = status.getReasonPhrase();
        err.message = message;
        err.path = path;
        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "Credenciales inválidas", req.getRequestURI());
    }

    @ExceptionHandler({DisabledException.class, LockedException.class})
    public ResponseEntity<ApiError> handleDisabledOrLocked(RuntimeException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiError> handleUserNotFound(UsernameNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        ApiError err = new ApiError();
        err.status = HttpStatus.BAD_REQUEST.value();
        err.error = HttpStatus.BAD_REQUEST.getReasonPhrase();
        err.message = "Solicitud inválida";
        err.path = req.getRequestURI();
        err.errors = ex.getBindingResult().getFieldErrors().stream()
            .map(f -> new ApiError.FieldError(f.getField(), f.getDefaultMessage()))
            .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiError> handleBind(BindException ex, HttpServletRequest req) {
        ApiError err = new ApiError();
        err.status = HttpStatus.BAD_REQUEST.value();
        err.error = HttpStatus.BAD_REQUEST.getReasonPhrase();
        err.message = "Solicitud inválida";
        err.path = req.getRequestURI();
        err.errors = ex.getBindingResult().getFieldErrors().stream()
            .map(f -> new ApiError.FieldError(f.getField(), f.getDefaultMessage()))
            .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Cuerpo de la petición inválido o malformado", req.getRequestURI());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleConflict(DataIntegrityViolationException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, "Conflicto de integridad de datos", req.getRequestURI());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArg(IllegalArgumentException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", req.getRequestURI());
    }
}
