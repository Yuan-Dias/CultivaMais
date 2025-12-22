package br.com.cultiva.cultivamais.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. IMPORTANTE: Integra com sua configuração de CORS existente
                .cors(cors -> cors.configure(http))

                // 2. Desativa CSRF (Necessário para APIs REST)
                .csrf(csrf -> csrf.disable())

                // 3. Libera acesso total (já que você está controlando login manualmente no Controller)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll() // Libera todas as rotas da API
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}