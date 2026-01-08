package ec.mil.dsndft.servicio_catalogos.model.dto;

import ec.mil.dsndft.servicio_catalogos.entity.PasswordChangeStatus;

import java.time.LocalDateTime;

public class PasswordChangeRequestDTO {

    private Long id;
    private String username;
    private String contactEmail;
    private String motivo;
    private PasswordChangeStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private String processedBy;
    private String adminNotes;
    private Boolean unlockAccount;

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
