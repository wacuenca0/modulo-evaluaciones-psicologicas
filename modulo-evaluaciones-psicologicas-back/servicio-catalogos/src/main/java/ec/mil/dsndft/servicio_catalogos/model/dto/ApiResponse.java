package ec.mil.dsndft.servicio_catalogos.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    @Builder.Default
    private List<String> errors = Collections.emptyList();

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .message(message)
            .data(data)
            .errors(Collections.emptyList())
            .build();
    }

    public static <T> ApiResponse<T> success(String message) {
        return success(message, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return error(message, Collections.emptyList());
    }

    public static <T> ApiResponse<T> error(String message, List<String> errors) {
        return ApiResponse.<T>builder()
            .success(false)
            .message(message)
            .errors(errors == null ? Collections.emptyList() : errors)
            .build();
    }
}
