package br.com.cultiva.cultivamais.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class AreaCultivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idArea;
    private String nomeArea;
    private String localizacaoArea;
    private double latitudeArea;
    private double longitudeArea;
    private double tamanhoArea;

    @Enumerated(EnumType.STRING)
    private TipoSolo tipoSolo;
    private String observacaoArea;

    @OneToMany(mappedBy = "areaCultivo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Cultivo> cultivos = new ArrayList<>();

    public AreaCultivo (String nomeArea){
        
        this.nomeArea = nomeArea;

        this.tamanhoArea = 0.0;
        this.tipoSolo = null;
        this.observacaoArea = null;
        this.localizacaoArea = null;
        this.latitudeArea = 0.0;
        this.longitudeArea = 0.0;
        this.cultivos = new ArrayList<>();
    }

    public AreaCultivo() {}

    //Getters
    public Long getIdArea() {
        return idArea;
    }
    public String getNomeArea(){
        return this.nomeArea;
    }
    public String getLocalizacaoArea(){
        return this.localizacaoArea;
    }
    public double getLatitudeArea(){
        return this.latitudeArea;
    }
    public double getLongitudeArea(){
        return this.longitudeArea;
    }
    public double getTamanhoArea(){
        return this.tamanhoArea;
    }
    public TipoSolo getTipoSolo(){
        return this.tipoSolo;
    }
    public String getObservacaoArea(){
        return this.observacaoArea;
    }
    public List<Cultivo> getCultivos(){
        return this.cultivos;
    }

    //Setters
    public void setIdArea(Long idArea) {
        this.idArea = idArea;
    }
    public void setNomeArea(String nomeArea){
        this.nomeArea = nomeArea;
    }
    public void setLocalizacaoArea(String localizacaoArea){
        this.localizacaoArea = localizacaoArea;
    }
    public void setLongitudeArea(double longitudeArea){
        this.longitudeArea = longitudeArea;
    }
    public void setLatitudeArea(double latitudeArea){
        this.latitudeArea = latitudeArea;
    }
    public void setTamanhoArea(double tamanhoArea){
        this.tamanhoArea = tamanhoArea;
    }
    public void setTipoSolo(TipoSolo tipoSolo){
        this.tipoSolo = tipoSolo;
    }
    public void setObservacaoArea(String observacaoArea) {
        this.observacaoArea = observacaoArea;
    }
    public void adicionarCultivo(Cultivo novoCultivo) {
        if (novoCultivo != null) {
            if (this.cultivos == null) {
                this.cultivos = new ArrayList<>();
            }
            this.cultivos.add(novoCultivo);
            novoCultivo.setAreaCultivo(this);
        }
    }
    public void setCultivos(List<Cultivo> cultivos) {
        this.cultivos = cultivos;
    }
}
