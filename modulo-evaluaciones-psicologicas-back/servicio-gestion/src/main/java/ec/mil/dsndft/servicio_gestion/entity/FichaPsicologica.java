package ec.mil.dsndft.servicio_gestion.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "fichas_psicologicas")
public class FichaPsicologica {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_fichas_psicologicas")
    @SequenceGenerator(name = "seq_fichas_psicologicas", sequenceName = "seq_fichas_psicologicas", allocationSize = 1)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "personal_militar_id", nullable = false)
    private PersonalMilitar personalMilitar;

    @ManyToOne(optional = false)
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Psicologo psicologo;

    @Column(nullable = false)
    private LocalDate fechaEvaluacion;

    @Column(length = 30)
    private String tipoEvaluacion;

    @Column(nullable = false, length = 50)
    private String nroHistoriaClinica;

    @Column(nullable = false, columnDefinition = "CLOB")
    private String observacionClinica;

    @Column(nullable = false, columnDefinition = "CLOB")
    private String motivoConsulta;

    @Column(columnDefinition = "CLOB")
    private String enfermedadActual;

    @Column(columnDefinition = "CLOB")
    private String historiaPasadaEnfermedad;

    @Column(nullable = false)
    private Boolean tomaMedicacion = false;

    @Column(columnDefinition = "CLOB")
    private String tipoMedicacion;

    @Column(nullable = false)
    private Boolean hospitalizacionRehabilitacion = false;

    @Column(length = 100)
    private String tiempoHospitalizacion;

    @Column(columnDefinition = "CLOB")
    private String exposicionIntrauterina;

    @Column(columnDefinition = "CLOB")
    private String condicionesEconomicasSociales;

    @Column(nullable = false)
    private Boolean partoNormal;

    @Column(columnDefinition = "CLOB")
    private String complicacionesParto;

    @Column(columnDefinition = "CLOB")
    private String etapasEvolutivasNatales;

    @Column(length = 100)
    private String gradoSociabilidad;

    @Column(columnDefinition = "CLOB")
    private String relacionPadresHermanos;

    @Column(nullable = false)
    private Boolean discapacidadIntelectual = false;

    @Column(length = 100)
    private String gradoDiscapacidad;

    @Column(nullable = false)
    private Boolean trastornosEpilepsia = false;

    @Column(nullable = false)
    private Boolean tratamientosPsicologicosPsiquiatricos = false;

    @Column(columnDefinition = "CLOB")
    private String observacionesFuncionesCognitivas;

    @Column(nullable = false)
    private String estado;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}