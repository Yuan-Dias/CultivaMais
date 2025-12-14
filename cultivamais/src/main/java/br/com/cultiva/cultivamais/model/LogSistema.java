package br.com.cultiva.cultivamais.model;

import jakarta.persistence.*; // Se der erro, troque 'jakarta' por 'javax'
import java.time.LocalDateTime;

@Entity
@Table(name = "logs_sistema")
public class LogSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Isso resolve seu erro de auto_increment
    private Long id;

    private String usuario; // Quem fez a ação
    private String acao;    // O que fez
    private LocalDateTime dataHora;

    // Construtor vazio (obrigatório pro Java)
    public LogSistema() {}

    // Construtor para facilitar
    public LogSistema(String usuario, String acao) {
        this.usuario = usuario;
        this.acao = acao;
        this.dataHora = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }
    public LocalDateTime getDataHora() { return dataHora; }
}