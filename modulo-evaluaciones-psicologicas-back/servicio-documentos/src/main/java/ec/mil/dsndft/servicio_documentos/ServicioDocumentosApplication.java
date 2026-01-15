package ec.mil.dsndft.servicio_documentos;

import ec.mil.dsndft.servicio_documentos.config.DocumentoStorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(DocumentoStorageProperties.class)
public class ServicioDocumentosApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServicioDocumentosApplication.class, args);
	}

}
