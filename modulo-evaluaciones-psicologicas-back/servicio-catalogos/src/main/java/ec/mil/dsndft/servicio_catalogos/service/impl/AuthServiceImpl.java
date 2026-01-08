package ec.mil.dsndft.servicio_catalogos.service.impl;

import ec.mil.dsndft.servicio_catalogos.config.JwtService;
import ec.mil.dsndft.servicio_catalogos.model.dto.LoginRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.UserDTO;
import ec.mil.dsndft.servicio_catalogos.model.mapper.UserMapper;
import ec.mil.dsndft.servicio_catalogos.repository.UsuarioRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import ec.mil.dsndft.servicio_catalogos.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    // AuthenticationManager injected but not used in simplified dev auth
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final UserMapper userMapper;
    private final boolean plainAuthEnabled;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(JwtService jwtService, UsuarioRepository usuarioRepository, UserMapper userMapper,
                           @Value("${security.dev.plainAuth:false}") boolean plainAuthEnabled,
                           PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.userMapper = userMapper;
        this.plainAuthEnabled = plainAuthEnabled;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public String login(LoginRequestDTO loginRequestDTO) {
        log.info("Login attempt for username={} (plainAuthEnabled={})", loginRequestDTO.getUsername(), plainAuthEnabled);
        var usuarioOpt = usuarioRepository.findByUsername(loginRequestDTO.getUsername());
        if (usuarioOpt.isEmpty()) {
            log.warn("User not found: {}", loginRequestDTO.getUsername());
            throw new BadCredentialsException("Credenciales inválidas");
        }
        var usuario = usuarioOpt.get();
        log.debug("Found user in DB username={}, role={}, activo={}, bloqueado={}, hashPresent={}",
            usuario.getUsername(),
            usuario.getRole() != null ? usuario.getRole().getNombre() : null,
            usuario.getActivo(), usuario.getBloqueado(), usuario.getPasswordHash() != null);

        if (Boolean.TRUE.equals(usuario.getBloqueado()) || !Boolean.TRUE.equals(usuario.getActivo())) {
            log.warn("User inactive or blocked: username={}, activo={}, bloqueado={}", usuario.getUsername(), usuario.getActivo(), usuario.getBloqueado());
            throw new DisabledException("Cuenta inactiva o bloqueada");
        }

        // Strict password validation: if hash is bcrypt, verify with encoder; if not, compare plaintext
        String stored = usuario.getPasswordHash();
        String provided = loginRequestDTO.getPassword();
        boolean isBcrypt = stored != null && (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$"));
        boolean passwordMatches = false;
        if (stored == null) {
            log.warn("No stored password for user {}", usuario.getUsername());
        } else if (isBcrypt) {
            passwordMatches = passwordEncoder.matches(provided, stored);
            log.info("Password bcrypt match={} for user {}", passwordMatches, usuario.getUsername());
        } else {
            passwordMatches = stored.equals(provided);
            log.info("Password plaintext match={} for user {}", passwordMatches, usuario.getUsername());
        }

        if (!passwordMatches) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        String roleName = usuario.getRole() != null ? usuario.getRole().getNombre() : "USER";
        String normalizedRole = roleName.toUpperCase();

        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername(usuario.getUsername())
            .password(usuario.getPasswordHash() != null ? usuario.getPasswordHash() : "")
            .roles(normalizedRole)
            .accountLocked(Boolean.TRUE.equals(usuario.getBloqueado()))
            .disabled(!Boolean.TRUE.equals(usuario.getActivo()))
            .build();
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", usuario.getId());
        extraClaims.put("usuarioId", usuario.getId());
        extraClaims.put("name", usuario.getUsername());
        extraClaims.put("fullName", usuario.getUsername());
        extraClaims.put("email", usuario.getEmail());
        extraClaims.put("role", normalizedRole);

        String token = jwtService.generateToken(extraClaims, userDetails);
        log.info("Login success for username={}", loginRequestDTO.getUsername());
        return token;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByUsername(username)
            .map(userMapper::toDTO)
            .orElseThrow();
    }
}