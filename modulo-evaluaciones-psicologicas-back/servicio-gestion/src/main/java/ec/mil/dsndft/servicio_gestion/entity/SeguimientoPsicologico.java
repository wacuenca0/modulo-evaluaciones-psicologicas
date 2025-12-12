package ec.mil.dsndft.servicio_gestion.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

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
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Psicologo psicologo;

    @Column(nullable = false)
    private LocalDate fechaSeguimiento;

    @Column(columnDefinition = "CLOB")
    private String observaciones;

    // Getters and setters
}