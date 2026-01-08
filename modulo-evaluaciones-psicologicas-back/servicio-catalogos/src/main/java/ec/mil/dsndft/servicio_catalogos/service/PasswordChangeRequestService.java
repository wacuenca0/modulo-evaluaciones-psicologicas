package ec.mil.dsndft.servicio_catalogos.service;

import ec.mil.dsndft.servicio_catalogos.entity.PasswordChangeStatus;
import ec.mil.dsndft.servicio_catalogos.model.dto.AdminProcessPasswordChangeDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.CreatePasswordChangeRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.PasswordChangeRequestDTO;

import java.util.List;

public interface PasswordChangeRequestService {

    PasswordChangeRequestDTO submitRequest(CreatePasswordChangeRequestDTO requestDTO);

    List<PasswordChangeRequestDTO> getRequests(PasswordChangeStatus status);

    PasswordChangeRequestDTO completeRequest(Long requestId, AdminProcessPasswordChangeDTO dto, String adminUsername);

    PasswordChangeRequestDTO rejectRequest(Long requestId, String adminUsername, String adminNotes);
}
