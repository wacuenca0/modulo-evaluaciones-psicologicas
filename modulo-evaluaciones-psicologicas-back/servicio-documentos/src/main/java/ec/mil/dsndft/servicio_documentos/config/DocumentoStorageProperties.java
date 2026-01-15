package ec.mil.dsndft.servicio_documentos.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "documentos.storage")
public class DocumentoStorageProperties {

    /**
     * Ruta base local donde se almacenan los archivos digitales.
     */
    private String basePath = "./storage/documentos";

    public String getBasePath() {
        return basePath;
    }

    public void setBasePath(String basePath) {
        this.basePath = basePath;
    }
}
