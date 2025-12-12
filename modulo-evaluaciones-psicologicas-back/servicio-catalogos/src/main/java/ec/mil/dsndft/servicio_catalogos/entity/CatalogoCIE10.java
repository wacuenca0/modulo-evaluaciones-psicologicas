package ec.mil.dsndft.servicio_catalogos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "catalogo_cie10")
public class CatalogoCIE10 {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_catalogo_cie10")
    @SequenceGenerator(name = "seq_catalogo_cie10", sequenceName = "seq_catalogo_cie10", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String codigo;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}