package ec.mil.dsndft.servicio_catalogos.config;

import ec.mil.dsndft.servicio_catalogos.entity.Usuario;
import ec.mil.dsndft.servicio_catalogos.repository.UsuarioRepository;
import ec.mil.dsndft.servicio_catalogos.entity.Role;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        Role role = usuario.getRole();
        String normalizedRole = "USER";
        if (role != null && role.getNombre() != null && !role.getNombre().isBlank()) {
            normalizedRole = role.getNombre().trim().toUpperCase(Locale.ROOT);
        }
        boolean enabled = Boolean.TRUE.equals(usuario.getActivo());
        boolean accountLocked = Boolean.TRUE.equals(usuario.getBloqueado());

        return User
            .withUsername(usuario.getUsername())
            .password(usuario.getPasswordHash())
            .roles(normalizedRole)
            .disabled(!enabled)
            .accountLocked(accountLocked)
            .build();
    }
}
