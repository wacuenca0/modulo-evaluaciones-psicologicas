package ec.mil.dsndft.servicio_catalogos.service;

import ec.mil.dsndft.servicio_catalogos.model.dto.LoginRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.UserDTO;

public interface AuthService {
    String login(LoginRequestDTO loginRequestDTO);
    UserDTO getCurrentUser();
}