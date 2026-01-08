package ec.mil.dsndft.servicio_catalogos.config;

import ec.mil.dsndft.servicio_catalogos.entity.Role;
import ec.mil.dsndft.servicio_catalogos.entity.Usuario;
import ec.mil.dsndft.servicio_catalogos.repository.RoleRepository;
import ec.mil.dsndft.servicio_catalogos.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
public class DefaultDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DefaultDataInitializer.class);

    private final RoleRepository roleRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean bootstrapEnabled;

    public DefaultDataInitializer(RoleRepository roleRepository,
                                  UsuarioRepository usuarioRepository,
                                  PasswordEncoder passwordEncoder,
                                  @Value("${app.bootstrap.default-user.enabled:true}") boolean bootstrapEnabled) {
        this.roleRepository = roleRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapEnabled = bootstrapEnabled;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!bootstrapEnabled) {
            log.info("Default data bootstrap disabled");
            return;
        }

        Role adminRole = ensureRole("ADMINISTRADOR", "Rol administrador del catálogo", 10);
        Role psicologoRole = ensureRole("PSICOLOGO", "Rol psicólogo del catálogo", 5);

        ensureDefaultAdminUser(adminRole);

        usuarioRepository.findByUsername("psicologo01").ifPresentOrElse(existing -> {
            boolean dirty = false;
            if (existing.getRole() == null || !psicologoRole.getId().equals(existing.getRole().getId())) {
                existing.setRole(psicologoRole);
                dirty = true;
            }
            String storedHash = existing.getPasswordHash();
            if (storedHash == null || !passwordEncoder.matches("Admin#123", storedHash)) {
                existing.setPasswordHash(passwordEncoder.encode("Admin#123"));
                dirty = true;
            }
            if (existing.getEmail() == null) {
                existing.setEmail("psicologo01@example.com");
                dirty = true;
            }
            if (!Boolean.TRUE.equals(existing.getActivo())) {
                existing.setActivo(true);
                dirty = true;
            }
            if (Boolean.TRUE.equals(existing.getBloqueado())) {
                existing.setBloqueado(false);
                dirty = true;
            }
            if (dirty) {
                usuarioRepository.save(existing);
                log.info("Default user psicologo01 normalized");
            }
        }, () -> {
            Usuario usuario = new Usuario();
            usuario.setUsername("psicologo01");
            usuario.setPasswordHash(passwordEncoder.encode("Admin#123"));
            usuario.setRole(psicologoRole);
            usuario.setActivo(true);
            usuario.setBloqueado(false);
            usuario.setEmail("psicologo01@example.com");
            usuarioRepository.save(usuario);
            log.info("Default user psicologo01 created");
        });
    }

    private void ensureDefaultAdminUser(Role adminRole) {
        usuarioRepository.findByUsername("admin").ifPresentOrElse(existing -> {
            boolean dirty = false;
            if (existing.getRole() == null || adminRole == null || !adminRole.getId().equals(existing.getRole().getId())) {
                existing.setRole(adminRole);
                dirty = true;
            }
            String storedHash = existing.getPasswordHash();
            if (storedHash == null || !passwordEncoder.matches("Admin#123", storedHash)) {
                existing.setPasswordHash(passwordEncoder.encode("Admin#123"));
                dirty = true;
            }
            if (existing.getEmail() == null) {
                existing.setEmail("admin@example.com");
                dirty = true;
            }
            if (!Boolean.TRUE.equals(existing.getActivo())) {
                existing.setActivo(true);
                dirty = true;
            }
            if (Boolean.TRUE.equals(existing.getBloqueado())) {
                existing.setBloqueado(false);
                dirty = true;
            }
            if (dirty) {
                usuarioRepository.save(existing);
                log.info("Default user admin normalized");
            }
        }, () -> {
            Usuario usuario = new Usuario();
            usuario.setUsername("admin");
            usuario.setPasswordHash(passwordEncoder.encode("Admin#123"));
            usuario.setRole(adminRole);
            usuario.setActivo(true);
            usuario.setBloqueado(false);
            usuario.setEmail("admin@example.com");
            usuarioRepository.save(usuario);
            log.info("Default user admin created");
        });
    }

    private Role ensureRole(String nombre, String descripcion, int nivelPermisos) {
        return roleRepository.findByNombreIgnoreCase(nombre)
            .map(role -> updateRoleIfNecessary(role, descripcion, nivelPermisos))
            .orElseGet(() -> {
                Role role = new Role();
                role.setNombre(nombre.toUpperCase(Locale.ROOT));
                role.setDescripcion(descripcion);
                role.setNivelPermisos(nivelPermisos);
                role.setActivo(true);
                Role saved = roleRepository.save(role);
                log.info("Role {} created", nombre);
                return saved;
            });
    }

    private Role updateRoleIfNecessary(Role role, String descripcion, int nivelPermisos) {
        boolean dirty = false;
        if (role.getDescripcion() == null && descripcion != null) {
            role.setDescripcion(descripcion);
            dirty = true;
        }
        if (role.getNivelPermisos() == null || role.getNivelPermisos() < nivelPermisos) {
            role.setNivelPermisos(nivelPermisos);
            dirty = true;
        }
        if (!Boolean.TRUE.equals(role.getActivo())) {
            role.setActivo(true);
            dirty = true;
        }
        if (dirty) {
            return roleRepository.save(role);
        }
        return role;
    }
}
