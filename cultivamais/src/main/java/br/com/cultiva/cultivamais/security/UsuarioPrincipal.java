package br.com.cultiva.cultivamais.security;

import br.com.cultiva.cultivamais.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UsuarioPrincipal implements UserDetails {
    private Long id;
    private String email;
    private String senha;
    private Collection<? extends GrantedAuthority> authorities;

    public UsuarioPrincipal(Usuario usuario) {
        this.id = usuario.getIdUsuario();
        this.email = usuario.getEmail();
        this.senha = usuario.getSenha();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getFuncao().name()));
    }

    public Long getId() { return id; }
    @Override public String getUsername() { return email; }
    @Override public String getPassword() { return senha; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}