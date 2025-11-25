package br.com.cultiva.cultivamais.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
public class Usuario {

    // Atributos do Objeto
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;
    private String nomeUsuario;
    private String email;
    private String senha;
    private FuncaoUsuario funcao;

    //Construtor
    public Usuario(String nome, String email, String senha, FuncaoUsuario funcao) {
        this.nomeUsuario = nome;
        this.email = email;
        this.senha = senha;
        this.funcao = funcao;
    }

    public Usuario() { }

    // Getters
    public Long getIdUsuario(){ 
        return this.idUsuario;
    }
    public String getNomeUsuario(){
        return this.nomeUsuario;
    }
    public String getEmail(){
        return this.email;
    }
    public String getSenha(){
        return this.senha;
    }
    public FuncaoUsuario getFuncao() {
        return this.funcao;
    }

    // Setters
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
    public void setNomeUsuario(String novoNome) {
        this.nomeUsuario = novoNome;
    }
    public void setEmail(String novoEmail){
        this.email = novoEmail;
    }
    public void setSenha(String novaSenha){
        this.senha = novaSenha;
    }
    public void setFuncao(FuncaoUsuario funcao) {
        this.funcao = funcao;
    }   
}
