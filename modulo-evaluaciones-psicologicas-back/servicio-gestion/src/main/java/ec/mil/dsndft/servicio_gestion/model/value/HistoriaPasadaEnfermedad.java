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
public class HistoriaPasadaEnfermedad {

    private String descripcion;
    private Boolean tomaMedicacion;
    private String tipoMedicacion;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "requiere", column = @Column(name = "hist_rehab_requiere")),
        @AttributeOverride(name = "tipo", column = @Column(name = "hist_rehab_tipo", length = 200)),
        @AttributeOverride(name = "duracion", column = @Column(name = "hist_rehab_duracion", length = 100))
    })
    private HospitalizacionRehabilitacion hospitalizacionRehabilitacion;
}
