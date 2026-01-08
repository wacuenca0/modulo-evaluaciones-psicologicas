package ec.mil.dsndft.servicio_gestion.service.support;

import ec.mil.dsndft.servicio_gestion.config.JwtAuthenticatedUser;
import ec.mil.dsndft.servicio_gestion.entity.Psicologo;
import ec.mil.dsndft.servicio_gestion.repository.PsicologoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticatedPsicologoProvider {

    private final PsicologoRepository psicologoRepository;

    public Psicologo requireCurrent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new EntityNotFoundException("Usuario no autenticado");
        }

        Long tokenUserId = null;
        String username = null;
        String displayName = null;

        Object principal = authentication.getPrincipal();
        if (principal instanceof JwtAuthenticatedUser jwtUser) {
            tokenUserId = jwtUser.getUserId();
            username = jwtUser.getUsername();
            displayName = jwtUser.getDisplayName();
        } else if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
            displayName = userDetails.getUsername();
        } else if (principal instanceof String strPrincipal && !strPrincipal.isBlank()) {
            username = strPrincipal;
            displayName = strPrincipal;
        }

        if (username == null || username.isBlank()) {
            throw new EntityNotFoundException("No se pudo determinar el usuario autenticado");
        }

        final String resolvedUsername = username;
        final Long resolvedUserId = tokenUserId;
        final String resolvedDisplayName = displayName;

        Psicologo psicologo = psicologoRepository.findByUsernameIgnoreCase(resolvedUsername)
            .map(this::reactivarSiEstabaInactivo)
            .orElseGet(() -> crearPsicologo(resolvedUsername, resolvedUserId, resolvedDisplayName));

        if (Boolean.FALSE.equals(psicologo.getActivo())) {
            throw new EntityNotFoundException("El psicólogo asociado a la sesión está inactivo");
        }

        return psicologo;
    }

    public Optional<Psicologo> findCurrent() {
        try {
            return Optional.of(requireCurrent());
        } catch (EntityNotFoundException ex) {
            log.warn("No se pudo resolver el psicólogo autenticado: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private Psicologo crearPsicologo(String username, Long tokenUserId, String displayName) {
        if (tokenUserId == null) {
            log.error("No se pudo auto-registrar psicólogo para {} porque el token no incluye userId", username);
            throw new EntityNotFoundException("No se pudo vincular el psicólogo autenticado con su usuario. Contacte al administrador.");
        }
        String[] nombreSplit = dividirNombre(displayName != null && !displayName.isBlank() ? displayName : username);
        String nombres = nombreSplit[1];
        String apellidos = nombreSplit[0];

        if (apellidos == null && nombres == null) {
            apellidos = capitalizar(username);
            nombres = "Psicologo";
        } else {
            if (apellidos == null) {
                apellidos = nombres != null ? nombres : capitalizar(username);
            }
            if (nombres == null) {
                nombres = apellidos != null ? apellidos : capitalizar(username);
            }
        }

        apellidos = limitarLongitud(valorNoVacio(apellidos, capitalizar(username)), 120);
        nombres = limitarLongitud(valorNoVacio(nombres, "Psicologo"), 120);

        Psicologo nuevo = Psicologo.builder()
            .cedula(generarCedulaAuto(username, tokenUserId))
            .usuarioId(tokenUserId)
            .nombres(nombres)
            .apellidos(apellidos)
            .username(limitarLongitud(username, 50))
            .activo(Boolean.TRUE)
            .build();
        nuevo.refreshNombreCompleto();
        Psicologo creado = psicologoRepository.save(nuevo);
        log.info("Se creó el registro de psicólogo {} con usuario {}", creado.getId(), username);
        return creado;
    }

    private String generarCedulaAuto(String username, Long userId) {
        String base = userId != null ? String.format(Locale.ROOT, "UID%09d", userId) : username;
        if (base == null) {
            base = "PSICOLOGO";
        }
        base = base.replaceAll("[^A-Za-z0-9]", "");
        if (base.isEmpty()) {
            base = "PSICOLOGO";
        }
        if (base.length() > 10) {
            base = base.substring(0, 10);
        }
        return base.toUpperCase(Locale.ROOT);
    }

    private Psicologo reactivarSiEstabaInactivo(Psicologo psicologo) {
        if (Boolean.FALSE.equals(psicologo.getActivo())) {
            psicologo.setActivo(Boolean.TRUE);
            psicologo.setUpdatedAt(LocalDateTime.now());
            psicologo = psicologoRepository.save(psicologo);
        }
        return psicologo;
    }

    private String[] dividirNombre(String nombreCompleto) {
        if (nombreCompleto == null || nombreCompleto.isBlank()) {
            return new String[] {null, null};
        }
        String normalizado = nombreCompleto.trim().replaceAll("\\s+", " ");
        int ultimoEspacio = normalizado.lastIndexOf(' ');
        if (ultimoEspacio <= 0) {
            return new String[] {null, capitalizar(normalizado)};
        }
        String apellidos = normalizado.substring(0, ultimoEspacio).trim();
        String nombres = normalizado.substring(ultimoEspacio + 1).trim();
        return new String[] {capitalizar(apellidos), capitalizar(nombres)};
    }

    private String capitalizar(String texto) {
        if (texto == null) {
            return null;
        }
        String lower = texto.toLowerCase(Locale.ROOT);
        String[] partes = lower.split(" ");
        StringBuilder builder = new StringBuilder();
        for (String parte : partes) {
            if (parte.isBlank()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(parte.charAt(0))).append(parte.substring(1));
        }
        return builder.toString();
    }

    private String valorNoVacio(String valor, String fallback) {
        if (valor == null) {
            return fallback;
        }
        String trimmed = valor.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }

    private String limitarLongitud(String valor, int max) {
        if (valor == null) {
            return null;
        }
        String trimmed = valor.trim();
        if (trimmed.length() <= max) {
            return trimmed;
        }
        return trimmed.substring(0, max);
    }
}
