package ec.mil.dsndft.servicio_catalogos.config;

import ec.mil.dsndft.servicio_catalogos.entity.Role;
import ec.mil.dsndft.servicio_catalogos.entity.Usuario;
import ec.mil.dsndft.servicio_catalogos.repository.RoleRepository;
import ec.mil.dsndft.servicio_catalogos.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Role administrador = ensureRole("Administrador", "Acceso completo al sistema", 100);
        ensureRole("Psicologo", "Psicólogo que realiza evaluaciones", 50);
        ensureRole("Observador", "Solo puede visualizar reportes", 10);
        ensureAdminUser(administrador);
    }

    private Role ensureRole(String nombre, String descripcion, int nivelPermisos) {
        return roleRepository.findByNombreIgnoreCase(nombre)
            .map(existing -> {
                if (!Boolean.TRUE.equals(existing.getActivo())) {
                    existing.setActivo(true);
                    existing.setDescripcion(descripcion);
                    existing.setNivelPermisos(nivelPermisos);
                    log.info("Reactivando rol {} con id {}", nombre, existing.getId());
                    return roleRepository.save(existing);
                }
                return existing;
            })
            .orElseGet(() -> {
                Role nuevo = new Role();
                nuevo.setNombre(nombre);
                nuevo.setDescripcion(descripcion);
                nuevo.setNivelPermisos(nivelPermisos);
                nuevo.setActivo(true);
                Role saved = roleRepository.save(nuevo);
                log.info("Creado rol {} con id {}", nombre, saved.getId());
                return saved;
            });
    }

    private void ensureAdminUser(Role administrador) {
        usuarioRepository.findByUsername("admin")
            .ifPresentOrElse(usuario -> {
                boolean updated = false;
                if (usuario.getRole() == null || !Objects.equals(usuario.getRole().getId(), administrador.getId())) {
                    usuario.setRole(administrador);
                    updated = true;
                    log.info("Asignado rol Administrador al usuario existente 'admin'");
                }
                if (usuario.getPasswordHash() == null || usuario.getPasswordHash().isBlank()) {
                    usuario.setPasswordHash(passwordEncoder.encode("admin123"));
                    updated = true;
                    log.info("Restablecida contraseña por defecto para usuario 'admin'");
                }
                if (!Boolean.TRUE.equals(usuario.getActivo())) {
                    usuario.setActivo(true);
                    updated = true;
                    log.info("Reactivado usuario 'admin'");
                }
                if (Boolean.TRUE.equals(usuario.getBloqueado())) {
                    usuario.setBloqueado(false);
                    updated = true;
                    log.info("Desbloqueado usuario 'admin'");
                }
                if (updated) {
                    usuarioRepository.save(usuario);
                }
            }, () -> {
                Usuario admin = new Usuario();
                admin.setUsername("admin");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@sistema.com");
                admin.setRole(administrador);
                admin.setActivo(true);
                admin.setBloqueado(false);
                usuarioRepository.save(admin);
                log.info("Creado usuario administrador por defecto 'admin'");
            });
    }
}
