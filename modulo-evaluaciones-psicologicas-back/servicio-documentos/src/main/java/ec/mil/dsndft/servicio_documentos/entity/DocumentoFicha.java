package ec.mil.dsndft.servicio_documentos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "documentos_ficha")
public class DocumentoFicha {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_documentos_ficha")
    @SequenceGenerator(name = "seq_documentos_ficha", sequenceName = "seq_documentos_ficha", allocationSize = 1)
    private Long id;

    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ficha_id", nullable = false)
    private FichaHistorica ficha;

    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_documento_id", nullable = false)
    private TipoDocumento tipoDocumento;

    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    @Column(name = "ruta_archivo", nullable = false, length = 500)
    private String rutaArchivo;

    @Column(columnDefinition = "CLOB")
    private String descripcion;

    @Column(name = "fecha_subida")
    private LocalDate fechaSubida;

    @Column(name = "tamano")
    private Long tamano;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = Boolean.TRUE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (fechaSubida == null) {
            fechaSubida = LocalDate.now();
        }
        if (activo == null) {
            activo = Boolean.TRUE;
        }
    }
}
