package ec.mil.dsndft.servicio_gestion.model.dto.reportes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DistribucionCategoriaDTO {
    private String categoria;
    private long total;
}
