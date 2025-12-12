package ec.mil.dsndft.servicio_catalogos.service.impl;

import ec.mil.dsndft.servicio_catalogos.model.dto.CreateUserRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.UpdateUserRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.UserDTO;
import ec.mil.dsndft.servicio_catalogos.entity.Role;
import ec.mil.dsndft.servicio_catalogos.entity.Usuario;
import ec.mil.dsndft.servicio_catalogos.model.mapper.UserMapper;
import ec.mil.dsndft.servicio_catalogos.repository.RoleRepository;
import ec.mil.dsndft.servicio_catalogos.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import ec.mil.dsndft.servicio_catalogos.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserServiceImpl(UsuarioRepository usuarioRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, UserMapper userMapper) {
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    @Override
    public UserDTO createUser(CreateUserRequestDTO createUserRequestDTO) {
        usuarioRepository.findByUsername(createUserRequestDTO.getUsername()).ifPresent(u -> {
            throw new IllegalArgumentException("Ya existe un usuario con ese nombre de usuario");
        });

        Role role = roleRepository.findById(createUserRequestDTO.getRoleId())
            .filter(Role::getActivo)
            .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado o inactivo"));

        Usuario usuario = new Usuario();
        usuario.setUsername(createUserRequestDTO.getUsername().trim());
        usuario.setPasswordHash(passwordEncoder.encode(createUserRequestDTO.getPassword()));
        usuario.setEmail(createUserRequestDTO.getEmail());
        usuario.setRole(role);
        usuario.setActivo(true);
        usuario.setBloqueado(false);
        usuarioRepository.save(usuario);
        return userMapper.toDTO(usuario);
    }

    @Override
    public UserDTO updateUser(UpdateUserRequestDTO updateUserRequestDTO) {
        Usuario usuario = usuarioRepository.findByUsername(updateUserRequestDTO.getUsername())
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (updateUserRequestDTO.getEmail() != null) {
            usuario.setEmail(updateUserRequestDTO.getEmail());
        }
        if (updateUserRequestDTO.getActive() != null) {
            usuario.setActivo(updateUserRequestDTO.getActive());
        }

        if (updateUserRequestDTO.getRoleId() != null) {
            Role role = roleRepository.findById(updateUserRequestDTO.getRoleId())
                .filter(Role::getActivo)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado o inactivo"));
            usuario.setRole(role);
        }

        usuarioRepository.save(usuario);
        return userMapper.toDTO(usuario);
    }

    @Override
    public void deleteUser(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuarioRepository.delete(usuario);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return usuarioRepository.findAll().stream()
            .map(userMapper::toDTO)
            .collect(Collectors.toList());
    }
}