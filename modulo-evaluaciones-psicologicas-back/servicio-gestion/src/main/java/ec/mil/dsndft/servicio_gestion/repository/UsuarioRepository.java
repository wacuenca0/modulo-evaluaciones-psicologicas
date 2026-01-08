package ec.mil.dsndft.servicio_gestion.repository;

import ec.mil.dsndft.servicio_gestion.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsernameIgnoreCase(String username);
}
