package ec.mil.dsndft.servicio_gestion.entity;

import lombok.*;
import jakarta.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "psicologos")
public class Psicologo {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_psicologos")
    @SequenceGenerator(name = "seq_psicologos", sequenceName = "seq_psicologos", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String cedula;

    @Column(nullable = false, length = 200)
    private String apellidosNombres;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @PrePersist
    protected void onCreate() {
        // timestamp logic can be added here if needed
    }
}