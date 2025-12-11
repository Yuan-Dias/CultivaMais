package br.com.cultiva.cultivamais.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class Cultivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCultivo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name  = "planta_id")
    private Planta plantaCultivada;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "areaCultivo_id")
    @JsonBackReference(value = "area-cultivos")
    private AreaCultivo areaCultivo;
    private LocalDate dataPlantio;
    private LocalDate previsaoColheita;
    private LocalDate dataColheitaFinal;

    @Enumerated(EnumType.STRING)
    private EstadoPlanta estadoPlanta;

    @Enumerated(EnumType.STRING)
    private StatusCultivo statusCultivo;
    private String observacaoCultivo;
    private double quantidadePlantada;
    private double quantidadeColhida;

    @OneToMany(mappedBy = "cultivo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "cultivo-eventos")
    private List<Evento> eventosRegistrados = new ArrayList<>();

    public Cultivo(Planta plantaCultivada, AreaCultivo areaCultivo, LocalDate dataPlantio, double quantidadePlantada){
    
        this.plantaCultivada = plantaCultivada;
        this.areaCultivo = areaCultivo;
        this.dataPlantio = dataPlantio;
        this.quantidadePlantada = quantidadePlantada;

        this.dataColheitaFinal = null;
        this.estadoPlanta = EstadoPlanta.SAUDAVEL;
        this.statusCultivo = StatusCultivo.ATIVO;
        this.observacaoCultivo = "";
        
        this.quantidadeColhida = 0.0;
        if (plantaCultivada != null) {
            this.previsaoColheita = dataPlantio.plusDays(plantaCultivada.getCicloMedioDias());
        }        
        this.eventosRegistrados = new ArrayList<>();
    }

    public Cultivo() { }

    //Getters
    public Long getIdCultivo() {
        return idCultivo;
    }
    public Planta getPlantaCultivada(){
        return this.plantaCultivada;
    }
    public Planta getPlanta() {
        return this.plantaCultivada;
    }
    public AreaCultivo getAreaCultivo(){
        return this.areaCultivo;
    }
    public LocalDate getDataPlantio(){
        return this.dataPlantio;
    }
    public LocalDate getPrevisaoColheita(){
        return this.previsaoColheita;
    }
    public LocalDate getColheitaFinal(){
        return this.dataColheitaFinal;
    }
    public EstadoPlanta getEstadoPlanta(){
        return this.estadoPlanta;
    }
    public StatusCultivo getStatusCultivo(){
        return this.statusCultivo;
    }
    public String getObservacaoCultivo(){
        return this.observacaoCultivo;
    }
    public double getQuantidadePlantada(){
        return this.quantidadePlantada;
    }
    public double getQuantidadeColhida(){
        return this.quantidadeColhida;
    }
    public List<Evento> getEventosRegistrados() {
        return this.eventosRegistrados;
    }

    //Setters
    public void setIdCultivo(Long idCultivo) {
        this.idCultivo = idCultivo;
    }
    public void setPlantaCultivada(Planta plantaCultivada){
        this.plantaCultivada = plantaCultivada;
    }
    public void setPlanta(Planta planta) {
        this.plantaCultivada = planta;
    }
    public void setAreaCultivo(AreaCultivo areaCultivo){
        this.areaCultivo = areaCultivo;
    }
    public void setDataPlantio(LocalDate dataPlantio){
        this.dataPlantio = dataPlantio;
    }
    public void setDataColheitaFinal(LocalDate dataColheitaFinal){
        this.dataColheitaFinal = dataColheitaFinal;
    }
    public void setEstadoPlanta(EstadoPlanta estadoPlanta) {
        this.estadoPlanta = estadoPlanta;
    }
    public void setStatusCultivo(StatusCultivo statusCultivo) {
        this.statusCultivo = statusCultivo;
    }
    public void setObservacaoCultivo(String observacaoCultivo){
        this.observacaoCultivo = observacaoCultivo;
    }
    public void setQuantidadePlantada(double quantidadePlantada) {
        this.quantidadePlantada = quantidadePlantada;
    }
    public void setQuantidadeColhida(double quantidadeColhida) {   
        this.quantidadeColhida = quantidadeColhida;
    }
    public void setEventosRegistrados(List<Evento> eventosRegistrados){
        this.eventosRegistrados = eventosRegistrados;
    }
    public void setPrevisaoColheita(LocalDate previsaoColheita) { 
        this.previsaoColheita = previsaoColheita; 
    }
    
    public void adicionarEvento(Evento novoEvento) {
        if (novoEvento != null) {
            if (this.eventosRegistrados == null) {
                this.eventosRegistrados = new ArrayList<>();
            }
            this.eventosRegistrados.add(novoEvento);
            novoEvento.setCultivo(this);
        }
    }
}
