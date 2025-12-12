package ec.mil.dsndft.servicio_documentos.entity.component;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class RecomendacionProfesional {

    @Column(name = "plan_intervencion", columnDefinition = "CLOB")
    private String planIntervencion;

    @Column(name = "objetivos_terapeuticos", columnDefinition = "CLOB")
    private String objetivosTerapeuticos;

    @Column(name = "intervenciones_propuestas", columnDefinition = "CLOB")
    private String intervencionesPropuestas;

    @Column(name = "derivaciones", columnDefinition = "CLOB")
    private String derivaciones;

    @Column(name = "recomendaciones_generales", columnDefinition = "CLOB")
    private String recomendacionesGenerales;

    @Column(name = "fecha_proxima_cita")
    private LocalDate fechaProximaCita;

    @Column(name = "responsable_nombre", length = 200)
    private String responsableNombre;

    @Column(name = "responsable_cargo", length = 150)
    private String responsableCargo;

    @Column(name = "responsable_identificacion", length = 50)
    private String responsableIdentificacion;

    @Column(name = "firma_digital_hash", length = 255)
    private String firmaDigitalHash;

    @Column(name = "observaciones_finales", columnDefinition = "CLOB")
    private String observacionesFinales;
}
