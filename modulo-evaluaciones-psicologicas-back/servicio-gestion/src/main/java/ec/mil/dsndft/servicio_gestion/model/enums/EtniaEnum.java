package ec.mil.dsndft.servicio_gestion.model.enums;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

public enum EtniaEnum {
    MESTIZA("Mestiza"),
    INDIGENA("Indigena", "Indígena"),
    AFROECUATORIANA("Afroecuatoriano", "Afroecuatoriana", "Afro ecuatoriana", "Afro-ecuatoriana"),
    MONTUBIO("Montubio"),
    BLANCO("Blanco", "Blanca"),
    OTRO("Otro", "Otros", "Otra");

    private final String canonical;
    private final Set<String> tokens;

    EtniaEnum(String canonical, String... aliases) {
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

    public static Optional<EtniaEnum> from(String raw) {
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
            .map(EtniaEnum::getCanonical)
            .orElse(null);
    }
}
