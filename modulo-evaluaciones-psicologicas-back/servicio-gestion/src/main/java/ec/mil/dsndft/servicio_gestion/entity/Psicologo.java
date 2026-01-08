package ec.mil.dsndft.servicio_gestion.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Objects;

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

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(nullable = false, length = 120)
    private String nombres;

    @Column(nullable = false, length = 120)
    private String apellidos;

    @Column(name = "apellidos_nombres", nullable = false, length = 240)
    private String apellidosNombres;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(length = 20)
    private String celular;

    @Column(length = 80)
    private String grado;

    @Column(name = "unidad_militar", length = 120)
    private String unidadMilitar;

    @Column(length = 120)
    private String especialidad;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = Boolean.TRUE;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (activo == null) {
            activo = Boolean.TRUE;
        }
        refreshNombreCompleto();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        refreshNombreCompleto();
    }

    public void refreshNombreCompleto() {
        String nombresLimpio = limpiar(nombres);
        String apellidosLimpio = limpiar(apellidos);
        if (apellidosLimpio == null && nombresLimpio == null) {
            this.apellidosNombres = username;
            return;
        }
        if (apellidosLimpio == null) {
            this.apellidosNombres = nombresLimpio;
            return;
        }
        if (nombresLimpio == null) {
            this.apellidosNombres = apellidosLimpio;
            return;
        }
        this.apellidosNombres = (apellidosLimpio + " " + nombresLimpio).trim();
    }

    private String limpiar(String valor) {
        if (valor == null) {
            return null;
        }
        String trimmed = valor.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}