package ec.mil.dsndft.servicio_gestion.config;

import java.io.Serial;
import java.io.Serializable;

import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;

/**
 * Representa el usuario autenticado a partir del JWT, preservando identificador y nombre visible.
 */
public class JwtAuthenticatedUser implements UserDetails, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private final Long userId;
    private final String username;
    private final String displayName;
    private final Collection<? extends GrantedAuthority> authorities;

    public JwtAuthenticatedUser(Long userId, String username, String displayName,
                                Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.username = username;
        this.displayName = displayName;
        this.authorities = authorities;
    }

    public Long getUserId() {
        return userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
