package br.com.cultiva.cultivamais.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    private String nomeUsuario;
    private String email;
    private String senha;

    private Boolean ativo = true;

    @Column(name = "codigo_recuperacao")
    private String codigoRecuperacao;

    @Enumerated(EnumType.STRING)
    private FuncaoUsuario funcao;

    // --- CORREÇÃO AQUI ---
    // O "mappedBy" TEM que ser igual ao nome da variável lá na classe Tarefa.
    // Como na Tarefa você usou "private Usuario responsavel;", aqui usamos "responsavel".
    @OneToMany(mappedBy = "responsavel", cascade = CascadeType.ALL)
    @JsonIgnore // Evita o Loop Infinito (Erro 500)
    private List<Tarefa> tarefas;

    public Usuario(String nome, String email, String senha, FuncaoUsuario funcao) {
        this.nomeUsuario = nome;
        this.email = email;
        this.senha = senha;
        this.funcao = funcao;
        this.ativo = true;
    }

    public Usuario() { }

    // Getters
    public Long getIdUsuario(){ return this.idUsuario; }
    public String getNomeUsuario(){ return this.nomeUsuario; }
    public String getEmail(){ return this.email; }
    public String getSenha(){ return this.senha; }
    public FuncaoUsuario getFuncao() { return this.funcao; }
    public Boolean getAtivo() { return this.ativo; }
    public String getCodigoRecuperacao() { return codigoRecuperacao; }
    public List<Tarefa> getTarefas() { return tarefas; }

    // Setters
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public void setNomeUsuario(String novoNome) { this.nomeUsuario = novoNome; }
    public void setEmail(String novoEmail){ this.email = novoEmail; }
    public void setSenha(String novaSenha){ this.senha = novaSenha; }
    public void setFuncao(FuncaoUsuario funcao) { this.funcao = funcao; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public void setCodigoRecuperacao(String codigoRecuperacao) { this.codigoRecuperacao = codigoRecuperacao; }
    public void setTarefas(List<Tarefa> tarefas) { this.tarefas = tarefas; }
}