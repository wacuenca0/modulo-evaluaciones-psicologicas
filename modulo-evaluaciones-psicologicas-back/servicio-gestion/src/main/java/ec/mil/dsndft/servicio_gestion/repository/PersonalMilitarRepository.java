package ec.mil.dsndft.servicio_gestion.repository;

import ec.mil.dsndft.servicio_gestion.entity.PersonalMilitar;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonalMilitarRepository extends JpaRepository<PersonalMilitar, Long> {
	Optional<PersonalMilitar> findByCedulaIgnoreCase(String cedula);
	boolean existsByCedulaIgnoreCase(String cedula);
	Page<PersonalMilitar> findByApellidosNombresContainingIgnoreCaseOrderByApellidosNombresAsc(String apellidosNombres, Pageable pageable);
}