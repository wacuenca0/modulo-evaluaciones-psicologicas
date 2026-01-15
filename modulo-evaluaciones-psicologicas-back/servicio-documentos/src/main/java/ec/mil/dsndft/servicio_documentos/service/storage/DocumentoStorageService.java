package ec.mil.dsndft.servicio_documentos.service.storage;

import ec.mil.dsndft.servicio_documentos.config.DocumentoStorageProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class DocumentoStorageService {

    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    private final DocumentoStorageProperties properties;

    public DocumentoStorageService(DocumentoStorageProperties properties) {
        this.properties = properties;
    }

    public StorageLocation prepararUbicacion(Long fichaPsicologicaId, String nombreOriginal) {
        if (fichaPsicologicaId == null) {
            throw new IllegalArgumentException("El identificador de la ficha es obligatorio");
        }
        String nombreLimpio = sanitizarNombre(nombreOriginal);
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        String archivoDestino = timestamp + "-" + nombreLimpio;

        Path base = Paths.get(properties.getBasePath()).toAbsolutePath().normalize();
        Path carpetaFicha = base.resolve("fichas").resolve(String.valueOf(fichaPsicologicaId));
        try {
            Files.createDirectories(carpetaFicha);
        } catch (IOException e) {
            throw new IllegalStateException("No fue posible preparar la carpeta de almacenamiento local", e);
        }

        Path rutaAbsoluta = carpetaFicha.resolve(archivoDestino);
        Path rutaRelativa = Paths.get("fichas").resolve(String.valueOf(fichaPsicologicaId)).resolve(archivoDestino);
        return new StorageLocation(rutaAbsoluta, rutaRelativa);
    }

    private String sanitizarNombre(String nombreOriginal) {
        if (!StringUtils.hasText(nombreOriginal)) {
            return "documento.bin";
        }
        String normalizado = Normalizer.normalize(nombreOriginal, Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String limpio = normalizado.replaceAll("[^a-zA-Z0-9\\._-]", "-");
        String trimmed = limpio.trim();
        if (trimmed.isEmpty()) {
            return "documento.bin";
        }
        if (!trimmed.contains(".")) {
            return trimmed + ".bin";
        }
        return trimmed.toLowerCase(Locale.ROOT);
    }

    public record StorageLocation(Path rutaAbsoluta, Path rutaRelativa) {
    }
}
