package ec.mil.dsndft.servicio_catalogos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_usuarios")
    @SequenceGenerator(name = "seq_usuarios", sequenceName = "seq_usuarios", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Column(length = 100)
    private String email;

    @ManyToOne(optional = false)
    @JoinColumn(name = "rol_id", nullable = false)
    private Role role;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_ultimo_login")
    private LocalDateTime fechaUltimoLogin;

    @Column(name = "intentos_login", nullable = false)
    private Integer intentosLogin = 0;

    @Column(nullable = false)
    private Boolean bloqueado = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaUltimoLogin() {
        return fechaUltimoLogin;
    }

    public void setFechaUltimoLogin(LocalDateTime fechaUltimoLogin) {
        this.fechaUltimoLogin = fechaUltimoLogin;
    }

    public Integer getIntentosLogin() {
        return intentosLogin;
    }

    public void setIntentosLogin(Integer intentosLogin) {
        this.intentosLogin = intentosLogin;
    }

    public Boolean getBloqueado() {
        return bloqueado;
    }

    public void setBloqueado(Boolean bloqueado) {
        this.bloqueado = bloqueado;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}