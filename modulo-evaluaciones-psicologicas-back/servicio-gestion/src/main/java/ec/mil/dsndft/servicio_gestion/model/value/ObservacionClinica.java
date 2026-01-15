package ec.mil.dsndft.servicio_gestion.model.value;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class ObservacionClinica {

    private String observacionClinica;
    private String motivoConsulta;
    private String enfermedadActual;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "descripcion", column = @Column(name = "historia_pasada_enfermedad", columnDefinition = "CLOB")),
        @AttributeOverride(name = "tomaMedicacion", column = @Column(name = "historia_toma_medicacion")),
        @AttributeOverride(name = "tipoMedicacion", column = @Column(name = "historia_tipo_medicacion", length = 200))
    })
    private HistoriaPasadaEnfermedad historiaPasadaEnfermedad;
}
