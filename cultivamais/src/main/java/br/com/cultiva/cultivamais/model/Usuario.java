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

    // --- RELACIONAMENTOS ---
    // O @JsonIgnore aqui é FUNDAMENTAL. Não remova.

    @OneToMany(mappedBy = "responsavel", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Tarefa> tarefasAtribuidas;

    @OneToMany(mappedBy = "criador")
    @JsonIgnore
    private List<Tarefa> tarefasCriadas;

    // --- CONSTRUTORES ---
    public Usuario(String nome, String email, String senha, FuncaoUsuario funcao) {
        this.nomeUsuario = nome;
        this.email = email;
        this.senha = senha;
        this.funcao = funcao;
        this.ativo = true;
    }

    public Usuario() { }

    // --- GETTERS E SETTERS ---
    public Long getIdUsuario(){ return this.idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public String getNomeUsuario(){ return this.nomeUsuario; }
    public void setNomeUsuario(String novoNome) { this.nomeUsuario = novoNome; }

    public String getEmail(){ return this.email; }
    public void setEmail(String novoEmail){ this.email = novoEmail; }

    public String getSenha(){ return this.senha; }
    public void setSenha(String novaSenha){ this.senha = novaSenha; }

    public FuncaoUsuario getFuncao() { return this.funcao; }
    public void setFuncao(FuncaoUsuario funcao) { this.funcao = funcao; }

    public Boolean getAtivo() { return this.ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public String getCodigoRecuperacao() { return codigoRecuperacao; }
    public void setCodigoRecuperacao(String codigoRecuperacao) { this.codigoRecuperacao = codigoRecuperacao; }

    public List<Tarefa> getTarefasAtribuidas() { return tarefasAtribuidas; }
    public void setTarefasAtribuidas(List<Tarefa> tarefasAtribuidas) { this.tarefasAtribuidas = tarefasAtribuidas; }

    public List<Tarefa> getTarefasCriadas() { return tarefasCriadas; }
    public void setTarefasCriadas(List<Tarefa> tarefasCriadas) { this.tarefasCriadas = tarefasCriadas; }
}