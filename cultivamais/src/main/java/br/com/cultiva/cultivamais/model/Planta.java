package br.com.cultiva.cultivamais.model;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;


@Entity
public class Planta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPlanta;
    private String nomePopular;
    private String nomeCientifico;
    private String variedade;

    @Enumerated(EnumType.STRING)
    private TipoPlanta tipoPlanta;
    private int cicloMedioDias;
    private String descricaoPlanta;
    private int espacoRecomendado;

    @ElementCollection
    @CollectionTable(name = "planta_solos_recomendados", joinColumns = @JoinColumn(name = "planta_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_solo")
    private Set<TipoSolo> solosRecomendados;

    public Planta(String nomePopular, String nomeCientifico, String variedade, TipoPlanta tipoPlanta, int cicloMedioDias, String descricaoPlanta, int espacoRecomendado) {
        
        this.nomePopular = nomePopular;
        this.nomeCientifico = nomeCientifico;
        this.variedade = variedade;
        this.tipoPlanta = tipoPlanta;
        this.cicloMedioDias = cicloMedioDias;
        this.descricaoPlanta = descricaoPlanta;
        this.espacoRecomendado = espacoRecomendado;
        this.solosRecomendados = new HashSet<>();
    }

    public Planta() { }

    // Getters
    public Long getIdPlanta() {
        return idPlanta;
    }
    public String getNomePopular(){
        return this.nomePopular;
    }
    public String getNomeCientifico(){
        return this.nomeCientifico;
    }
    public String getVariedade(){
        return this.variedade;
    }
    public TipoPlanta getTipoPlanta(){
        return this.tipoPlanta;
    }
    public int getCicloMedioDias(){
        return this.cicloMedioDias;
    }
    public String getDescricaoPlanta(){
        return this.descricaoPlanta;
    }
    public int getEspacoRecomendado(){
        return this.espacoRecomendado;
    }
    public Set<TipoSolo> getSolosRecomendados() {
        return this.solosRecomendados;
    }

    // Setters
    public void setIdPlanta(Long idPlanta) {
        this.idPlanta = idPlanta;
    }
    public void setNomePopular(String nomePopular) {
        this.nomePopular = nomePopular;
    }
    public void setNomeCientifico(String nomeCientifico){
        this.nomeCientifico = nomeCientifico;
    }
    public void setVariedade(String variedade){
        this.variedade = variedade;
    }
    public void setTipoPlanta(TipoPlanta tipoPlanta){
        this.tipoPlanta = tipoPlanta;
    }
    public void setCicloMedioDias(int cicloMedioDias){
        this.cicloMedioDias = cicloMedioDias;
    }
    public void setDescricaoPlanta(String descricaoPlanta){
        this.descricaoPlanta = descricaoPlanta;
    }
    public void setEspacoRecomendado(int espacoRecomendado){
        this.espacoRecomendado = espacoRecomendado;
    }
    public void setSolosRecomendados(Set<TipoSolo> solosRecomendados) {
        this.solosRecomendados = solosRecomendados;
    }
}