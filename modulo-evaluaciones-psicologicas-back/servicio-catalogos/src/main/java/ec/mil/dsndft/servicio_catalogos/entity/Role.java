package ec.mil.dsndft.servicio_catalogos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_roles")
    @SequenceGenerator(name = "seq_roles", sequenceName = "seq_roles", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    @Column
    private String descripcion;

    @Column(name = "nivel_permisos", nullable = false)
    private Integer nivelPermisos = 1;

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

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getNivelPermisos() {
        return nivelPermisos;
    }

    public void setNivelPermisos(Integer nivelPermisos) {
        this.nivelPermisos = nivelPermisos;
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