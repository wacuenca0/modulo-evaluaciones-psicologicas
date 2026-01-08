package ec.mil.dsndft.servicio_catalogos.repository;

import ec.mil.dsndft.servicio_catalogos.entity.PasswordChangeRequest;
import ec.mil.dsndft.servicio_catalogos.entity.PasswordChangeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordChangeRequestRepository extends JpaRepository<PasswordChangeRequest, Long> {

    Optional<PasswordChangeRequest> findFirstByUsuarioUsernameAndStatus(String username, PasswordChangeStatus status);

    List<PasswordChangeRequest> findByStatusOrderByRequestedAtAsc(PasswordChangeStatus status);
}
