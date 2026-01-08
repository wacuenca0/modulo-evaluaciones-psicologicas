package ec.mil.dsndft.servicio_catalogos.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_change_requests")
public class PasswordChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_password_change_requests")
    @SequenceGenerator(name = "seq_password_change_requests", sequenceName = "seq_password_change_requests", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "username_snapshot", nullable = false, length = 50)
    private String usernameSnapshot;

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "motivo", length = 500)
    private String motivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PasswordChangeStatus status = PasswordChangeStatus.PENDIENTE;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by", length = 50)
    private String processedBy;

    @Column(name = "admin_notes", length = 500)
    private String adminNotes;

    @Column(name = "unlock_account")
    private Boolean unlockAccount;

    @PrePersist
    protected void onCreate() {
        this.requestedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = PasswordChangeStatus.PENDIENTE;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getUsernameSnapshot() {
        return usernameSnapshot;
    }

    public void setUsernameSnapshot(String usernameSnapshot) {
        this.usernameSnapshot = usernameSnapshot;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public PasswordChangeStatus getStatus() {
        return status;
    }

    public void setStatus(PasswordChangeStatus status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public String getProcessedBy() {
        return processedBy;
    }

    public void setProcessedBy(String processedBy) {
        this.processedBy = processedBy;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public Boolean getUnlockAccount() {
        return unlockAccount;
    }

    public void setUnlockAccount(Boolean unlockAccount) {
        this.unlockAccount = unlockAccount;
    }
}
