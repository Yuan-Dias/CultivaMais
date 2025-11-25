package br.com.cultiva.cultivamais.model;

import java.time.LocalDateTime;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@DiscriminatorValue("IRRIGACAO")
public class Irrigacao extends Evento {

    private double volumeAgua;

    @Enumerated(EnumType.STRING)
    private MetodoIrrigacao metodo;

    public Irrigacao(Cultivo cultivo, LocalDateTime dataHora, String observacao, double volumeAgua, MetodoIrrigacao metodo) {
        
        super(cultivo, dataHora, observacao);

        this.volumeAgua = volumeAgua;
        this.metodo = metodo;
    }

    public Irrigacao(){}

    //Getters
    public double getVolumeAgua() {
        return volumeAgua;
    }

    public void setVolumeAgua(double volumeAgua) {
        this.volumeAgua = volumeAgua;
    }

    public MetodoIrrigacao getMetodo() {
        return metodo;
    }

    public void setMetodo(MetodoIrrigacao metodo) {
        this.metodo = metodo;
    }
}