package br.com.cultiva.cultivamais.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // IMPORTANTE: Coloque aqui o endereço EXATO do seu React
                .allowedOrigins("http://localhost:5173", "http://localhost:3000") 
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "TRACE", "CONNECT")
                .allowedHeaders("*") // <--- Faltava isso! Permite Content-Type: application/json
                .allowCredentials(true); // <--- Permite cookies/auth se necessário
    }
}