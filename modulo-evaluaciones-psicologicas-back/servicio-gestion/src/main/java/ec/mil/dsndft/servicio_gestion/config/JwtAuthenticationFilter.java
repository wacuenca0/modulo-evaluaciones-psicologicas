package ec.mil.dsndft.servicio_gestion.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = authHeader.substring(7);
        try {
            var claims = jwtService.extractAllClaims(token);
            String username = claims.getSubject();
            log.info("JWT claims para {}: {}", username, claims);
                List<String> roles = (List<String>) claims.get("roles");
                List<SimpleGrantedAuthority> authorities = roles != null && !roles.isEmpty() ? roles.stream()
                        .map(r -> r == null ? "" : r.trim())
                        .filter(r -> !r.isEmpty())
                        .map(this::toAuthority)
                        .toList() : List.of();

            // Fallback temporal: si no hay roles en el token y el usuario es 'admin', asumir ADMINISTRADOR
            if ((roles == null || roles.isEmpty()) && "admin".equalsIgnoreCase(username)) {
                authorities = List.of(toAuthority("ADMINISTRADOR"));
                log.warn("Aplicando fallback de ADMINISTRADOR para usuario 'admin' por token sin roles.");
            }

            if (roles == null || roles.isEmpty()) {
                log.warn("JWT sin roles o vacíos para usuario: {}", username);
            } else {
                log.info("JWT roles leídos para {}: {}", username, roles);
            }

                Long userId = extractLong(claims, "userId", "usuarioId", "id", "uid");
                String displayName = extractString(claims, "name", "nombre", "fullName", "full_name", "apellidosNombres");

                JwtAuthenticatedUser principal = new JwtAuthenticatedUser(userId, username, displayName, authorities);
                Authentication authToken = new UsernamePasswordAuthenticationToken(principal, null, authorities);
                ((UsernamePasswordAuthenticationToken) authToken).setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
        } catch (Exception e) {
            // Invalid token: clear context; let entry point handle 401
            log.error("Token inválido o error al validar JWT: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }

        private SimpleGrantedAuthority toAuthority(String rawRole) {
            if (rawRole == null) {
                return new SimpleGrantedAuthority("ROLE_USER");
            }
            String normalized = rawRole.trim();
            if (normalized.isEmpty()) {
                return new SimpleGrantedAuthority("ROLE_USER");
            }
            String upper = normalized.toUpperCase();
            if (upper.equals("ADMIN") || upper.equals("ADMINISTRADOR")) {
                upper = "ROLE_ADMINISTRADOR";
            } else if (!upper.startsWith("ROLE_")) {
                upper = "ROLE_" + upper;
            }
            return new SimpleGrantedAuthority(upper);
        }

        private Long extractLong(io.jsonwebtoken.Claims claims, String... keys) {
            for (String key : keys) {
                if (claims.containsKey(key)) {
                    Object value = claims.get(key);
                    if (value instanceof Number number) {
                        return number.longValue();
                    }
                    if (value instanceof String text) {
                        try {
                            return Long.parseLong(text.trim());
                        } catch (NumberFormatException ignored) {
                        }
                    }
                }
            }
            return null;
        }

        private String extractString(io.jsonwebtoken.Claims claims, String... keys) {
            for (String key : keys) {
                if (claims.containsKey(key)) {
                    Object value = claims.get(key);
                    if (value instanceof String text && !text.isBlank()) {
                        return text.trim();
                    }
                }
            }
            return null;
        }
}
