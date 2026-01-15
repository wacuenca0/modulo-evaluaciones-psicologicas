package ec.mil.dsndft.servicio_gestion.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "personal_militar")
public class PersonalMilitar {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_personal_militar")
    @SequenceGenerator(name = "seq_personal_militar", sequenceName = "seq_personal_militar", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String cedula;

    @Column(nullable = false, length = 200)
    private String apellidosNombres;

    @Column(nullable = false, length = 20)
    private String tipoPersona;

    @Builder.Default
    @Column(nullable = false)
    private Boolean esMilitar = false;

    @Column(nullable = false)
    private LocalDate fechaNacimiento;

    @Column(nullable = false)
    private Integer edad;

    @Column(nullable = false, length = 10)
    private String sexo;

    @Column(length = 50)
    private String etnia;

    @Column(length = 50)
    private String estadoCivil;

    @Builder.Default
    @Column(nullable = false)
    private Integer nroHijos = 0;

    @Column(length = 100)
    private String ocupacion;

    @Builder.Default
    @Column(nullable = false)
    private Boolean servicioActivo = true;

    @Builder.Default
    @Column(nullable = false)
    private Boolean servicioPasivo = false;

    @Column(length = 100)
    private String seguro;

    @Column(length = 50)
    private String grado;

    @Column(length = 100)
    private String especialidad;

    @Column(name = "unidad_militar", length = 150)
    private String unidadMilitar;

    @Column(length = 100)
    private String provincia;

    @Column(length = 100)
    private String canton;

    @Column(length = 100)
    private String parroquia;

    @Column(length = 100)
    private String barrioSector;

    @Column(length = 20)
    private String telefono;

    @Column(length = 20)
    private String celular;

    @Column(length = 100)
    private String email;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}