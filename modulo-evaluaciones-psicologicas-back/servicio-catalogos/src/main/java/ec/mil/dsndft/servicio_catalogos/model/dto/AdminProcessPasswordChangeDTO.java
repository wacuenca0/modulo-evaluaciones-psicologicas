package ec.mil.dsndft.servicio_catalogos.model.dto;

public class AdminProcessPasswordChangeDTO {

    private String newPassword;
    private String adminNotes;
    private Boolean unlockAccount;

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
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
