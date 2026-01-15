package ec.mil.dsndft.servicio_gestion.model.value;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class TransferenciaInfo {

    @Column(name = "transferencia_fecha")
    private LocalDate fechaTransferencia;

    @Column(name = "transferencia_unidad", length = 150)
    private String unidadDestino;

    @Column(name = "transferencia_observacion", columnDefinition = "CLOB")
    private String observacion;
}
