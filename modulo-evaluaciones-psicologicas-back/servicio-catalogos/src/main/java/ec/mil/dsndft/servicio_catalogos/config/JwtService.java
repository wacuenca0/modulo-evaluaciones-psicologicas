package ec.mil.dsndft.servicio_catalogos.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // Inyectar clave desde configuración/variables de entorno (application.yml security.jwt)
    private final SecretKey key;
    private final String issuer;
    private final String audience;

    public JwtService(
        @Value("${security.jwt.secret:cambia-esta-clave-super-segura-de-32+caracteres-2025}") String secret,
        @Value("${security.jwt.issuer:}") String issuer,
        @Value("${security.jwt.audience:}") String audience
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.audience = audience;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

        public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        // Include authorities as a roles claim for frontend role-based UI
        var roles = userDetails.getAuthorities().stream()
            .map(a -> a.getAuthority())
            .toList();
        extraClaims.put("roles", roles);

        var builder = Jwts.builder()
            .setClaims(extraClaims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 10));

        if (StringUtils.hasText(issuer)) {
            builder.setIssuer(issuer);
        }
        if (StringUtils.hasText(audience)) {
            builder.setAudience(audience);
        }

        return builder
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
        }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}