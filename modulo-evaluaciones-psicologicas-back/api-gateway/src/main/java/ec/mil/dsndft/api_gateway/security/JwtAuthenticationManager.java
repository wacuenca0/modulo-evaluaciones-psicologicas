package ec.mil.dsndft.api_gateway.security;

import io.jsonwebtoken.Claims;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationManager implements ReactiveAuthenticationManager {

    private final JwtService jwtService;

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        return Mono.justOrEmpty(authentication)
            .map(Authentication::getCredentials)
            .filter(Objects::nonNull)
            .map(Object::toString)
            .flatMap(token -> Mono.fromCallable(() -> buildAuthentication(token))
                .subscribeOn(Schedulers.boundedElastic()))
            .switchIfEmpty(Mono.empty());
    }

    private Authentication buildAuthentication(String token) {
        Claims claims = jwtService.validateToken(token);
        List<GrantedAuthority> authorities = jwtService.extractAuthorities(claims);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
            claims.getSubject(), token, authorities
        );
        auth.setDetails(claims);
        return auth;
    }
}
