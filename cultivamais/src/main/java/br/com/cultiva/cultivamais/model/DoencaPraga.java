package br.com.cultiva.cultivamais.model;

import java.time.LocalDateTime;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@DiscriminatorValue("PRAGA_DOENCA")
public class DoencaPraga extends Evento {

    private String nomePragaOuDoenca;

    @Enumerated(EnumType.STRING)
    private NivelAfetacao nivelAfetacao;

    public DoencaPraga (Cultivo cultivo, LocalDateTime dataHora, String observacaoEvento, String nomePragaOuDoenca, NivelAfetacao nivelAfetacao) {

        super(cultivo, dataHora, observacaoEvento);

        this.nomePragaOuDoenca = nomePragaOuDoenca;
        this.nivelAfetacao = nivelAfetacao;
    }

    public DoencaPraga() {}

    //Getters
    public String getNomePragaOuDoenca() {
        return nomePragaOuDoenca;
    }
    public NivelAfetacao getNivelAfetacao() {
        return nivelAfetacao;
    }

    //Setters
    public void setNomePragaOuDoenca(String nomePragaOuDoenca) {
        this.nomePragaOuDoenca = nomePragaOuDoenca;
    }
    public void setNivelAfetacao(NivelAfetacao nivelAfetacao) {
        this.nivelAfetacao = nivelAfetacao;
    }
}