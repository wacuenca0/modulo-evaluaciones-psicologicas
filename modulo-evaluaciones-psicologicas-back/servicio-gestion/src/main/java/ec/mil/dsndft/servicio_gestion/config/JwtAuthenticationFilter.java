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
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) claims.get("roles");
            List<SimpleGrantedAuthority> authorities;
            if (roles != null && !roles.isEmpty()) {
                authorities = roles.stream()
                        .map(r -> r == null ? "" : r.trim())
                        .filter(r -> !r.isEmpty())
                        .map(r -> {
                            String u = r.toUpperCase();
                            if (u.equals("ADMINISTRADOR") || u.equals("ROLE_ADMINISTRADOR") || u.equals("ADMIN")) {
                                return new SimpleGrantedAuthority("ADMINISTRADOR");
                            }
                            return new SimpleGrantedAuthority(u);
                        })
                        .toList();
            } else {
                authorities = List.of();
            }

            // Fallback temporal: si no hay roles en el token y el usuario es 'admin', asumir ADMINISTRADOR
            if ((roles == null || roles.isEmpty()) && "admin".equalsIgnoreCase(username)) {
                authorities = List.of(new SimpleGrantedAuthority("ADMINISTRADOR"));
                log.warn("Aplicando fallback de ADMINISTRADOR para usuario 'admin' por token sin roles.");
            }

            if (roles == null || roles.isEmpty()) {
                log.warn("JWT sin roles o vacíos para usuario: {}", username);
            } else {
                log.info("JWT roles leídos para {}: {}", username, roles);
            }

                    Authentication authToken = new UsernamePasswordAuthenticationToken(username, null, authorities);
                ((UsernamePasswordAuthenticationToken) authToken).setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
        } catch (Exception e) {
            // Invalid token: clear context; let entry point handle 401
            log.error("Token inválido o error al validar JWT: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }
}
