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
@Table(name = "asignaciones_psicologos")
public class AsignacionPsicologo {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_asignaciones_psicologos")
    @SequenceGenerator(name = "seq_asignaciones_psicologos", sequenceName = "seq_asignaciones_psicologos", allocationSize = 1)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Psicologo psicologo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "personal_militar_id", nullable = false)
    private PersonalMilitar personalMilitar;

    @Column(nullable = false)
    private LocalDate fechaAsignacion;

    @Column(columnDefinition = "CLOB")
    private String motivoAsignacion;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}