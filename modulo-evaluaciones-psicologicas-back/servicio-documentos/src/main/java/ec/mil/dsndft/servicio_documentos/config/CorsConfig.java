package ec.mil.dsndft.servicio_documentos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origin-patterns:http://localhost:*,https://localhost:*}") String allowedOriginPatterns) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        List<String> originPatterns = Arrays.stream(allowedOriginPatterns.split(","))
            .map(String::trim)
            .filter(pattern -> !pattern.isEmpty())
            .toList();
        config.setAllowedOriginPatterns(originPatterns);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        config.setExposedHeaders(List.of("Authorization"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
