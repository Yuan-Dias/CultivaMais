package br.com.cultiva.cultivamais.model;

import java.time.LocalDateTime;

public class Adubacao extends Evento {
    private String tipoAdubo;
    private double quantidadeAdubo;

    public Adubacao(Cultivo cultivo, LocalDateTime dataHora, String observacaoEvento, String tipoAdubo, double quantidadeAdubo) {
        
        super(cultivo, dataHora, observacaoEvento);

        this.tipoAdubo = tipoAdubo;
        this.quantidadeAdubo = quantidadeAdubo;
    }
    
    //Getters
    public String getTipoAdubo() {
        return tipoAdubo;
    }
    public double getQuantidade() {
        return quantidadeAdubo;
    }

    //Setters
    public void setTipoAdubo(String tipoAdubo) {
        this.tipoAdubo = tipoAdubo;
    }
    public void setQuantidade(double quantidade) {
        this.quantidadeAdubo = quantidade;
    }
}
