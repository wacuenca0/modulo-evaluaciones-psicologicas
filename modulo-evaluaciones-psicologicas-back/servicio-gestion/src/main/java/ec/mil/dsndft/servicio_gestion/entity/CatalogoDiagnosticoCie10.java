package ec.mil.dsndft.servicio_gestion.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "cie10_trastornos_mentales")
public class CatalogoDiagnosticoCie10 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 15)
    private String codigo;

    @Column(nullable = false, length = 500)
    private String nombre;

    @Column(name = "categoria_padre", length = 15)
    private String categoriaPadre;

    @Column(nullable = false)
    private Integer nivel;

    @Column(nullable = false, length = 2000)
    private String descripcion;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = Boolean.TRUE;

    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Builder.Default
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    public void marcarActualizado() {
        fechaActualizacion = LocalDateTime.now();
    }

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        normalizarCodigo();
        normalizarNombre();
        if (fechaCreacion == null) {
            fechaCreacion = now;
        }
        if (fechaActualizacion == null) {
            fechaActualizacion = now;
        }
        if (activo == null) {
            activo = Boolean.TRUE;
        }
        normalizarCategoriaPadre();
        if (nivel == null) {
            nivel = 0;
        }
        if (descripcion == null) {
            descripcion = "";
        }
    }

    @PreUpdate
    void onUpdate() {
        normalizarCodigo();
        normalizarNombre();
        normalizarCategoriaPadre();
        marcarActualizado();
    }

    private void normalizarCodigo() {
        if (codigo != null) {
            codigo = codigo.trim().toUpperCase();
        }
    }

    private void normalizarNombre() {
        if (nombre != null) {
            nombre = nombre.trim();
        }
    }

    private void normalizarCategoriaPadre() {
        if (categoriaPadre != null) {
            String trimmed = categoriaPadre.trim();
            categoriaPadre = trimmed.isEmpty() ? null : trimmed.toUpperCase();
        }
    }
}
