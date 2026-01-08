package ec.mil.dsndft.servicio_catalogos.repository;

import ec.mil.dsndft.servicio_catalogos.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

	Optional<Role> findByNombreIgnoreCase(String nombre);
}