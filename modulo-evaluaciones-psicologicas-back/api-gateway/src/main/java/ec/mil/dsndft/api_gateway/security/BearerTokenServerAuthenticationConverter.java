package ec.mil.dsndft.api_gateway.security;

import java.util.Locale;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class BearerTokenServerAuthenticationConverter implements ServerAuthenticationConverter {

    @Override
    public Mono<Authentication> convert(ServerWebExchange exchange) {
        return Mono.justOrEmpty(resolveToken(exchange))
            .map(token -> new UsernamePasswordAuthenticationToken(token, token));
    }

    private String resolveToken(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(authHeader) && authHeader.toLowerCase(Locale.ENGLISH).startsWith("bearer ")) {
            return authHeader.substring(7).trim();
        }
        String tokenQueryParam = exchange.getRequest().getQueryParams().getFirst("token");
        return StringUtils.hasText(tokenQueryParam) ? tokenQueryParam.trim() : null;
    }
}
