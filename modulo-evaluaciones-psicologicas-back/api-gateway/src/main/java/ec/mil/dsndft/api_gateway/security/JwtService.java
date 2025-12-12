package ec.mil.dsndft.api_gateway.security;

import ec.mil.dsndft.api_gateway.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties properties;

    private Key signingKey;

    @PostConstruct
    void init() {
        String secret = properties.getSecret();
        Assert.hasText(secret, "JWT secret must not be empty");
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        Assert.isTrue(keyBytes.length >= 32, "JWT secret must contain at least 32 bytes");
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims validateToken(String token) {
        try {
            var parserBuilder = Jwts.parserBuilder().setSigningKey(signingKey);
            if (StringUtils.hasText(properties.getIssuer())) {
                parserBuilder.requireIssuer(properties.getIssuer());
            }
            Claims claims = parserBuilder.build().parseClaimsJws(token).getBody();
            validateAudience(claims);
            return claims;
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BadCredentialsException("Invalid JWT token", ex);
        }
    }

    public List<GrantedAuthority> extractAuthorities(Claims claims) {
        Object rawAuthorities = claims.get(properties.getAuthoritiesClaim());
        if (rawAuthorities instanceof Collection<?> collection) {
            return collection.stream()
                .map(Objects::toString)
                .filter(StringUtils::hasText)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        }
        if (rawAuthorities instanceof String textAuthorities) {
            return Arrays.stream(textAuthorities.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        }
        return List.of();
    }

    private void validateAudience(Claims claims) {
        if (!StringUtils.hasText(properties.getAudience())) {
            return;
        }
        boolean audienceMatches = extractAudience(claims)
            .anyMatch(candidate -> candidate.equals(properties.getAudience()));
        if (!audienceMatches) {
            throw new BadCredentialsException("Invalid JWT audience");
        }
    }

    private Stream<String> extractAudience(Claims claims) {
        Object audClaim = claims.get("aud");
        if (audClaim instanceof Collection<?> collection) {
            return collection.stream()
                .map(Objects::toString)
                .map(String::trim)
                .filter(StringUtils::hasText);
        }
        if (audClaim != null) {
            return Arrays.stream(audClaim.toString().split(","))
                .map(String::trim)
                .filter(StringUtils::hasText);
        }
        String audience = claims.getAudience();
        if (!StringUtils.hasText(audience)) {
            return Stream.empty();
        }
        return Arrays.stream(audience.split(","))
            .map(String::trim)
            .filter(StringUtils::hasText);
    }
}
