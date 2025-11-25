package br.com.cultiva.cultivamais.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "TIPO_EVENTO")
public abstract class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEvento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cultivo_id")
    @JsonBackReference(value = "cultivo-eventos")
    private Cultivo cultivo;

    private LocalDateTime dataHora;
    private String observacaoEvento;

    public Evento(Cultivo cultivo, LocalDateTime dataHora, String observacaoEvento) {
        this.cultivo = cultivo;
        this.dataHora = dataHora;
        this.observacaoEvento = observacaoEvento;
    }

    public Evento () {}

    //Getters
    public Long getIdEvento() {
        return idEvento;
    }
    public Cultivo getCultivo() {
        return cultivo;
    }
    public LocalDateTime getDataHora() {
        return dataHora;
    }
    public String getObservacaoEvento() {
        return observacaoEvento;
    }

    //Setters
    public void setIdEvento(Long idEvento) {
        this.idEvento = idEvento;
    }
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
    public void setObservacaoEvento(String observacaoEvento) {
        this.observacaoEvento = observacaoEvento;
    }
    public void setCultivo(Cultivo cultivo) {
        this.cultivo = cultivo;
    }
}