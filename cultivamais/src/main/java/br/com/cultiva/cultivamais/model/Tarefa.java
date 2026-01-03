package br.com.cultiva.cultivamais.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descricao;

    @Enumerated(EnumType.STRING)
    private Prioridade prioridade;

    private String categoria;
    private LocalDateTime dataPrazo;

    private boolean concluida;
    private boolean cancelada = false;
    private String observacaoConclusao;

    private LocalDateTime dataCriacao;
    private LocalDateTime dataConclusao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "responsavel_id")
    @JsonIgnoreProperties({"tarefasAtribuidas", "tarefasCriadas", "senha"})
    private Usuario responsavel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "criador_id")
    @JsonIgnoreProperties({"tarefasAtribuidas", "tarefasCriadas", "senha", "hibernateLazyInitializer", "handler"})
    private Usuario criador;

    public Tarefa() {}

    // MÉTODO DE COMPATIBILIDADE PARA O SERVICE
    public StatusTarefa getStatus() {
        if (this.cancelada) return StatusTarefa.CANCELADA;
        if (this.concluida) return StatusTarefa.CONCLUIDA;
        return StatusTarefa.PENDENTE;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Prioridade getPrioridade() { return prioridade; }
    public void setPrioridade(Prioridade prioridade) { this.prioridade = prioridade; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public LocalDateTime getDataPrazo() { return dataPrazo; }
    public void setDataPrazo(LocalDateTime dataPrazo) { this.dataPrazo = dataPrazo; }
    public boolean isConcluida() { return concluida; }
    public void setConcluida(boolean concluida) { this.concluida = concluida; }
    public boolean isCancelada() { return cancelada; }
    public void setCancelada(boolean cancelada) { this.cancelada = cancelada; }
    public String getObservacaoConclusao() { return observacaoConclusao; }
    public void setObservacaoConclusao(String observacaoConclusao) { this.observacaoConclusao = observacaoConclusao; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
    public LocalDateTime getDataConclusao() { return dataConclusao; }
    public void setDataConclusao(LocalDateTime dataConclusao) { this.dataConclusao = dataConclusao; }
    public Usuario getResponsavel() { return responsavel; }
    public void setResponsavel(Usuario responsavel) { this.responsavel = responsavel; }
    public Usuario getCriador() { return criador; }
    public void setCriador(Usuario criador) { this.criador = criador; }
}