package ec.mil.dsndft.servicio_gestion.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "catalogo_condiciones")
public class CatalogoCondicion {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_catalogo_condiciones")
    @SequenceGenerator(name = "seq_catalogo_condiciones", sequenceName = "seq_catalogo_condiciones", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(columnDefinition = "CLOB")
    private String descripcion;

    @Column(length = 7)
    private String colorIndicador;
}