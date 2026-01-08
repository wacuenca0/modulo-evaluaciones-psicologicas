package ec.mil.dsndft.servicio_gestion.model.enums;

import java.text.Normalizer;
import java.util.Locale;

final class EnumNormalizer {

    private EnumNormalizer() {
    }

    static String normalizeToken(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        String normalized = Normalizer.normalize(trimmed, Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
            .replace('Ñ', 'N')
            .replace('ñ', 'n');
        normalized = normalized.toUpperCase(Locale.ROOT)
            .replaceAll("[^A-Z0-9]+", "_");
        normalized = normalized.replaceAll("^_+|_+$", "");
        return normalized;
    }
}
