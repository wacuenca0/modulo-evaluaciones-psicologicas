package ec.mil.dsndft.servicio_catalogos.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

// Deprecated duplicate implementation kept temporarily to avoid bean name conflict.
// Remove this class once all references are updated.
// NOTE: Not annotated as a Spring bean to prevent ConflictingBeanDefinitionException.
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Implement logic to fetch user details from the database
        throw new UsernameNotFoundException("User not found with username: " + username);
    }
}