package ec.mil.dsndft.servicio_catalogos.model.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String username;
    private String password;
}