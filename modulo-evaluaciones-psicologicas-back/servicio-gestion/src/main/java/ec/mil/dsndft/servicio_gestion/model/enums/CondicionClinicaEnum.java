package ec.mil.dsndft.servicio_gestion.model.enums;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

public enum CondicionClinicaEnum {
    ALTA("No presenta psicopatologia (Alta)", "Alta", "Sin psicopatologia"),
    SEGUIMIENTO("Seguimiento (Requiere citas periodicas)", "Seguimiento", "Control"),
    TRANSFERENCIA("Transferencia (Derivado a otro especialista o unidad)", "Transferencia", "Derivacion", "Derivación");

    private final String canonical;
    private final Set<String> tokens;

    CondicionClinicaEnum(String canonical, String... aliases) {
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

    public static Optional<CondicionClinicaEnum> from(String raw) {
        String token = EnumNormalizer.normalizeToken(raw);
        if (token == null) {
            return Optional.empty();
        }
        return Arrays.stream(values())
            .filter(value -> value.tokens.contains(token))
            .findFirst();
    }

    public static CondicionClinicaEnum normalizeRequired(String raw) {
        return from(raw)
            .orElseThrow(() -> new IllegalArgumentException("Condicion clinica no soportada: " + raw));
    }

    public static CondicionClinicaEnum normalizeOptional(String raw) {
        return from(raw).orElse(null);
    }

    public boolean requierePlan() {
        return this == SEGUIMIENTO || this == TRANSFERENCIA;
    }
}