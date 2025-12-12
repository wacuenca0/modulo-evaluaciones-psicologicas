package ec.mil.dsndft.servicio_documentos.entity.component;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class HistoriaClinica {

    @Column(name = "antecedentes_personales", columnDefinition = "CLOB")
    private String antecedentesPersonales;

    @Column(name = "antecedentes_familiares", columnDefinition = "CLOB")
    private String antecedentesFamiliares;

    @Column(name = "enfermedades_actuales", columnDefinition = "CLOB")
    private String enfermedadesActuales;

    @Column(name = "tratamientos_previos", columnDefinition = "CLOB")
    private String tratamientosPrevios;

    @Column(name = "cirugias_previas", columnDefinition = "CLOB")
    private String cirugiasPrevias;

    @Column(name = "hospitalizaciones_previas", columnDefinition = "CLOB")
    private String hospitalizacionesPrevias;

    @Column(name = "alergias", columnDefinition = "CLOB")
    private String alergias;

    @Column(name = "medicacion_actual", columnDefinition = "CLOB")
    private String medicacionActual;

    @Column(name = "consumo_sustancias", columnDefinition = "CLOB")
    private String consumoSustancias;

    @Column(name = "habitos_salud", columnDefinition = "CLOB")
    private String habitosSalud;

    @Column(name = "sueno_descripcion", columnDefinition = "CLOB")
    private String suenoDescripcion;

    @Column(name = "horas_sueno")
    private Integer horasSueno;

    @Column(name = "alimentacion", columnDefinition = "CLOB")
    private String alimentacion;

    @Column(name = "actividad_fisica", columnDefinition = "CLOB")
    private String actividadFisica;
}
