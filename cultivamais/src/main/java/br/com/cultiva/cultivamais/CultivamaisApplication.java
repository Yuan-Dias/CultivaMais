package br.com.cultiva.cultivamais;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CultivamaisApplication {

    public static void main(String[] args) {
        SpringApplication.run(CultivamaisApplication.class, args);
    }

}