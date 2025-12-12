package ec.mil.dsndft.servicio_catalogos.controller;

import ec.mil.dsndft.servicio_catalogos.model.dto.CreateUserRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.UpdateUserRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.UserDTO;
import ec.mil.dsndft.servicio_catalogos.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequestDTO createUserRequestDTO) {
        UserDTO userDTO = userService.createUser(createUserRequestDTO);
        return ResponseEntity.ok(userDTO);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping
    public ResponseEntity<UserDTO> updateUser(@RequestBody UpdateUserRequestDTO updateUserRequestDTO) {
        UserDTO userDTO = userService.updateUser(updateUserRequestDTO);
        return ResponseEntity.ok(userDTO);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{username}")
    public ResponseEntity<Void> deleteUser(@PathVariable String username) {
        userService.deleteUser(username);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
}