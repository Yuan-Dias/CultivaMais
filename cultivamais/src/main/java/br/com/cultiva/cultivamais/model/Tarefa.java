package br.com.cultiva.cultivamais.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Tarefa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descricao;
    
    @Enumerated(EnumType.STRING)
    private Prioridade prioridade;
    
    private String categoria; // Ex: Irrigação, Adubação
    private LocalDateTime dataPrazo;
    private boolean concluida;

    // Relacionamento com Usuário (para atribuir tarefas)
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario responsavel;

    public Tarefa() {}

    public Tarefa(String titulo, String descricao, Prioridade prioridade, String categoria, LocalDateTime dataPrazo, Usuario responsavel) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.categoria = categoria;
        this.dataPrazo = dataPrazo;
        this.responsavel = responsavel;
        this.concluida = false;
    }

    // Getters
    public Long getId() { 
        return id; 
    }
    public String getTitulo() { 
        return titulo; 
    }
    public String getDescricao() { 
        return descricao;
    }
    public Prioridade getPrioridade() { 
        return prioridade; 
    }
    public String getCategoria() { 
        return categoria; 
    }
    public LocalDateTime getDataPrazo() { 
        return dataPrazo; 
    }
    public boolean isConcluida() { 
        return concluida; 
    }
    public Usuario getResponsavel() { 
        return responsavel; 
    }

    // Setters
    public void setId(Long id) { 
        this.id = id; 
    }
    public void setTitulo(String titulo) { 
        this.titulo = titulo; 
    }
    public void setDescricao(String descricao) { 
        this.descricao = descricao; 
    }
    public void setPrioridade(Prioridade prioridade) { 
        this.prioridade = prioridade; 
    }
    public void setCategoria(String categoria) { 
        this.categoria = categoria; 
    }
    public void setDataPrazo(LocalDateTime dataPrazo) { 
        this.dataPrazo = dataPrazo; 
    }
    public void setConcluida(boolean concluida) { 
        this.concluida = concluida; 
    }
    public void setResponsavel(Usuario responsavel) {
        this.responsavel = responsavel; 
    }
}