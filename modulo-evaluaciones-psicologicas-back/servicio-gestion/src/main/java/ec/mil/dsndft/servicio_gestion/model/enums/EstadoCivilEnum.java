package ec.mil.dsndft.servicio_gestion.model.enums;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

public enum EstadoCivilEnum {
    SOLTERO("Soltero", "Soltera"),
    CASADO("Casado", "Casada"),
    DIVORCIADO("Divorciado", "Divorciada"),
    VIUDO("Viudo", "Viuda"),
    UNION_LIBRE("Union libre", "Union de hecho", "Union", "Union-libre", "Union Libre", "Union Estable", "Un\u00EDon libre", "Un\u00EDon de hecho"),
    SEPARADO("Separado", "Separada"),
    OTRO("Otro", "Otra");

    private final String canonical;
    private final Set<String> tokens;

    EstadoCivilEnum(String canonical, String... aliases) {
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

    public static Optional<EstadoCivilEnum> from(String raw) {
        String token = EnumNormalizer.normalizeToken(raw);
        if (token == null) {
            return Optional.empty();
        }
        return Arrays.stream(values())
            .filter(value -> value.tokens.contains(token))
            .findFirst();
    }

    public static String normalizeOptional(String raw) {
        return from(raw)
            .map(EstadoCivilEnum::getCanonical)
            .orElse(null);
    }
}
