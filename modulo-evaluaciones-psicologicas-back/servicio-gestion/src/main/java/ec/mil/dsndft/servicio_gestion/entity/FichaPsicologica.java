package ec.mil.dsndft.servicio_gestion.entity;

import ec.mil.dsndft.servicio_gestion.model.enums.CondicionClinicaEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.TipoEvaluacionEnum;
import ec.mil.dsndft.servicio_gestion.model.value.DiagnosticoCie10;
import ec.mil.dsndft.servicio_gestion.model.value.ObservacionClinica;
import ec.mil.dsndft.servicio_gestion.model.value.PlanSeguimiento;
import ec.mil.dsndft.servicio_gestion.model.value.TransferenciaInfo;
import ec.mil.dsndft.servicio_gestion.model.value.PsicoanamnesisInfancia;
import ec.mil.dsndft.servicio_gestion.model.value.PsicoanamnesisNatal;
import ec.mil.dsndft.servicio_gestion.model.value.PsicoanamnesisPrenatal;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.ConstraintMode;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
    name = "fichas_psicologicas",
    indexes = {
        @Index(name = "ix_fichas_psicologicas_cie", columnList = "catalogo_cie10_id")
    }
)
public class FichaPsicologica {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_fichas_psicologicas")
    @SequenceGenerator(name = "seq_fichas_psicologicas", sequenceName = "seq_fichas_psicologicas", allocationSize = 1)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "personal_militar_id", nullable = false)
    private PersonalMilitar personalMilitar;

    @ManyToOne(optional = false)
    @JoinColumn(name = "psicologo_id", nullable = false, foreignKey = @ForeignKey(value = ConstraintMode.NO_CONSTRAINT))
    @NotFound(action = NotFoundAction.IGNORE)
    private Psicologo psicologo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por_psicologo_id", foreignKey = @ForeignKey(value = ConstraintMode.NO_CONSTRAINT))
    @NotFound(action = NotFoundAction.IGNORE)
    private Psicologo creadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actualizado_por_psicologo_id", foreignKey = @ForeignKey(value = ConstraintMode.NO_CONSTRAINT))
    @NotFound(action = NotFoundAction.IGNORE)
    private Psicologo actualizadoPor;

    @Column(nullable = false, unique = true, length = 40)
    private String numeroEvaluacion;

    @Column(nullable = false)
    private LocalDate fechaEvaluacion;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private TipoEvaluacionEnum tipoEvaluacion;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "observacionClinica", column = @Column(name = "observacion_clinica", columnDefinition = "CLOB")),
        @AttributeOverride(name = "motivoConsulta", column = @Column(name = "motivo_consulta", columnDefinition = "CLOB")),
        @AttributeOverride(name = "enfermedadActual", column = @Column(name = "enfermedad_actual", columnDefinition = "CLOB"))
    })
    private ObservacionClinica seccionObservacion;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "condicionesBiologicasPadres", column = @Column(name = "prenatal_condiciones_biologicas", columnDefinition = "CLOB")),
        @AttributeOverride(name = "condicionesPsicologicasPadres", column = @Column(name = "prenatal_condiciones_psicologicas", columnDefinition = "CLOB")),
        @AttributeOverride(name = "observacion", column = @Column(name = "prenatal_observacion", columnDefinition = "CLOB"))
    })
    private PsicoanamnesisPrenatal seccionPrenatal;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "partoNormal", column = @Column(name = "natal_parto_normal")),
        @AttributeOverride(name = "termino", column = @Column(name = "natal_termino", length = 50)),
        @AttributeOverride(name = "complicaciones", column = @Column(name = "natal_complicaciones", length = 500)),
        @AttributeOverride(name = "observacion", column = @Column(name = "natal_observacion", columnDefinition = "CLOB"))
    })
    private PsicoanamnesisNatal seccionNatal;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "gradoSociabilidad", column = @Column(name = "infancia_grado_sociabilidad")),
        @AttributeOverride(name = "relacionPadresHermanos", column = @Column(name = "infancia_relacion_padres_hermanos")),
        @AttributeOverride(name = "discapacidadIntelectual", column = @Column(name = "infancia_discapacidad_intelectual")),
        @AttributeOverride(name = "gradoDiscapacidad", column = @Column(name = "infancia_grado_discapacidad")),
        @AttributeOverride(name = "trastornos", column = @Column(name = "infancia_trastornos", length = 500)),
        @AttributeOverride(name = "tratamientosPsicologicosPsiquiatricos", column = @Column(name = "infancia_tratamientos_psico")),
        @AttributeOverride(name = "observacion", column = @Column(name = "infancia_observacion", columnDefinition = "CLOB"))
    })
    private PsicoanamnesisInfancia seccionInfancia;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private EstadoFichaEnum estado = EstadoFichaEnum.ABIERTA;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "condicion_clinica", nullable = false, length = 40)
    private CondicionClinicaEnum condicionClinica = CondicionClinicaEnum.ALTA;

    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalogo_cie10_id", foreignKey = @ForeignKey(name = "fk_fichas_psicologicas_catalogo_cie"))
    private CatalogoDiagnosticoCie10 diagnosticoCie10Catalogo;

    @Embedded
    private DiagnosticoCie10 diagnosticoCie10;

    @Embedded
    private PlanSeguimiento planSeguimiento;

    @Embedded
    private TransferenciaInfo transferenciaInfo;

    @Column(name = "ultima_fecha_seguimiento")
    private LocalDate ultimaFechaSeguimiento;

    @Column(name = "proximo_seguimiento")
    private LocalDate proximoSeguimiento;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (fechaEvaluacion == null) {
            fechaEvaluacion = LocalDate.now();
        }
        if (seccionObservacion == null) {
            seccionObservacion = new ObservacionClinica();
        }
        if (seccionPrenatal == null) {
            seccionPrenatal = new PsicoanamnesisPrenatal();
        }
        if (seccionNatal == null) {
            seccionNatal = new PsicoanamnesisNatal();
        }
        if (seccionInfancia == null) {
            seccionInfancia = new PsicoanamnesisInfancia();
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}