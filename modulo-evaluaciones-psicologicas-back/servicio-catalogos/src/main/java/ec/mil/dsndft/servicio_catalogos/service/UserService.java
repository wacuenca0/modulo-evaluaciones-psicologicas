package ec.mil.dsndft.servicio_catalogos.service;

import ec.mil.dsndft.servicio_catalogos.model.dto.CreateUserRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.UpdateUserRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.UserDTO;

import java.util.List;

public interface UserService {
    UserDTO createUser(CreateUserRequestDTO createUserRequestDTO);
    UserDTO updateUser(UpdateUserRequestDTO updateUserRequestDTO);
    void deleteUser(String username);
    List<UserDTO> getAllUsers();
}