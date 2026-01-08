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
@Table(name = "seguimientos_psicologicos")
public class SeguimientoPsicologico {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_seguimientos_psicologicos")
    @SequenceGenerator(name = "seq_seguimientos_psicologicos", sequenceName = "seq_seguimientos_psicologicos", allocationSize = 1)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "ficha_psicologica_id", nullable = false)
    private FichaPsicologica fichaPsicologica;

    @ManyToOne(optional = false)
    @JoinColumn(name = "psicologo_id", nullable = false, foreignKey = @ForeignKey(value = ConstraintMode.NO_CONSTRAINT))
    private Psicologo psicologo;

    @Column(nullable = false)
    private LocalDate fechaSeguimiento;

    @Column(columnDefinition = "CLOB")
    private String observaciones;

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
        if (fechaSeguimiento == null) {
            fechaSeguimiento = LocalDate.now();
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}