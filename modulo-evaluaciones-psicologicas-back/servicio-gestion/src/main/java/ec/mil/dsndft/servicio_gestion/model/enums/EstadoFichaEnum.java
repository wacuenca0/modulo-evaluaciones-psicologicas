package ec.mil.dsndft.servicio_gestion.model.enums;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

public enum EstadoFichaEnum {
    ACTIVA("Activa", "ACTIVO"),
    ABIERTA("Abierta"),
    EN_SEGUIMIENTO("En seguimiento", "Seguimiento"),
    OBSERVACION("Observacion", "Observación"),
    CERRADA("Cerrada"),
    ARCHIVADA("Archivada"),
    OTRO("Otro", "Otra");

    private final String canonical;
    private final Set<String> tokens;

    EstadoFichaEnum(String canonical, String... aliases) {
        this.canonical = canonical;
        Set<String> normalized = new HashSet<>();
        normalized.add(EnumNormalizer.normalizeToken(canonical));
        Arrays.stream(aliases)
            .map(EnumNormalizer::normalizeToken)
            .filter(token -> token != null && !token.isEmpty())
            .forEach(normalized::add);
        this.tokens = Collections.unmodifiableSet(normalized);
    }

    public String getCanonical() {
        return canonical;
    }

    public static Optional<EstadoFichaEnum> from(String raw) {
        String token = EnumNormalizer.normalizeToken(raw);
        if (token == null) {
            return Optional.empty();
        }
        return Arrays.stream(values())
            .filter(value -> value.tokens.contains(token))
            .findFirst();
    }

    public static String normalizeRequired(String raw) {
        return from(raw)
            .map(EstadoFichaEnum::getCanonical)
            .orElseThrow(() -> new IllegalArgumentException("Estado de ficha no soportado: " + raw));
    }

    public static String normalizeOptional(String raw) {
        return from(raw)
            .map(EstadoFichaEnum::getCanonical)
            .orElse(null);
    }
}
