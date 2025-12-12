package ec.mil.dsndft.servicio_documentos.entity;

import ec.mil.dsndft.servicio_documentos.entity.component.DatosIdentificacion;
import ec.mil.dsndft.servicio_documentos.entity.component.EvaluacionPsicologica;
import ec.mil.dsndft.servicio_documentos.entity.component.HistoriaClinica;
import ec.mil.dsndft.servicio_documentos.entity.component.HistoriaPsicologica;
import ec.mil.dsndft.servicio_documentos.entity.component.RecomendacionProfesional;
import ec.mil.dsndft.servicio_documentos.entity.enums.EstadoFicha;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "fichas_historicas")
public class FichaHistorica {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_fichas_historicas")
    @SequenceGenerator(name = "seq_fichas_historicas", sequenceName = "seq_fichas_historicas", allocationSize = 1)
    private Long id;

    @Embedded
    private DatosIdentificacion datosIdentificacion;

    @Embedded
    private HistoriaClinica historiaClinica;

    @Embedded
    private HistoriaPsicologica historiaPsicologica;

    @Embedded
    private EvaluacionPsicologica evaluacionPsicologica;

    @Embedded
    private RecomendacionProfesional recomendacionProfesional;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_ficha", length = 20, nullable = false)
    @Builder.Default
    private EstadoFicha estadoFicha = EstadoFicha.BORRADOR;

    @Column(name = "fecha_evaluacion")
    private LocalDate fechaEvaluacion;

    @Column(name = "psicologo_responsable", length = 200)
    private String psicologoResponsable;

    @Column(name = "dependencia_solicitante", length = 200)
    private String dependenciaSolicitante;

    @Column(name = "observaciones_generales", columnDefinition = "CLOB")
    private String observacionesGenerales;

    @Column(name = "creado_por", length = 100)
    private String creadoPor;

    @Column(name = "actualizado_por", length = 100)
    private String actualizadoPor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
