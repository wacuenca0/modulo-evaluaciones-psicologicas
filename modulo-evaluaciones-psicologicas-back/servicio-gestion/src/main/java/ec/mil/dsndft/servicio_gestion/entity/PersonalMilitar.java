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

    @Column(nullable = false)
    private Integer nroHijos = 0;

    @Column(length = 100)
    private String ocupacion;

    @Column(nullable = false)
    private Boolean servicioActivo = true;

    @Column(length = 100)
    private String seguro;

    @Column(length = 50)
    private String grado;

    @Column(length = 100)
    private String especialidad;

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

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

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