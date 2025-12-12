package ec.mil.dsndft.servicio_documentos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tipos_documento")
public class TipoDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_tipos_documento")
    @SequenceGenerator(name = "seq_tipos_documento", sequenceName = "seq_tipos_documento", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(columnDefinition = "CLOB")
    private String descripcion;

    @Builder.Default
    @Column(nullable = false)
    private Boolean obligatorio = Boolean.FALSE;

    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "tipoDocumento", fetch = FetchType.LAZY)
    private Set<DocumentoFicha> documentos = new HashSet<>();
}
