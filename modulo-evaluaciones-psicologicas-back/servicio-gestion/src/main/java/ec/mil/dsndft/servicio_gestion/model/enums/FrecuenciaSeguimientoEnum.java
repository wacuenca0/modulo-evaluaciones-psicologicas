package ec.mil.dsndft.servicio_gestion.model.enums;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

public enum FrecuenciaSeguimientoEnum {
    SEMANAL("Semanal", "Cada semana"),
    QUINCENAL("Quincenal", "Cada quince dias"),
    MENSUAL("Mensual", "Cada mes"),
    BIMESTRAL("Bimestral", "Cada dos meses"),
    TRIMESTRAL("Trimestral", "Cada tres meses"),
    PERSONALIZADA("Personalizada", "Segun necesidad");

    private final String canonical;
    private final Set<String> tokens;

    FrecuenciaSeguimientoEnum(String canonical, String... aliases) {
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

    public static Optional<FrecuenciaSeguimientoEnum> from(String raw) {
        String token = EnumNormalizer.normalizeToken(raw);
        if (token == null) {
            return Optional.empty();
        }
        return Arrays.stream(values())
            .filter(value -> value.tokens.contains(token))
            .findFirst();
    }

    public static FrecuenciaSeguimientoEnum normalizeOptional(String raw) {
        return from(raw).orElse(null);
    }
}