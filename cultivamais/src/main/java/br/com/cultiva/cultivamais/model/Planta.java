package br.com.cultiva.cultivamais.model;

import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.*;

@Entity
public class Planta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPlanta;

    private String nomePopular;
    private String nomeCientifico;

    @Enumerated(EnumType.STRING)
    private TipoPlanta tipoPlanta;

    private int cicloMedioDias;
    private String descricaoPlanta;
    private boolean excluido = false;

    @Enumerated(EnumType.STRING)
    private QuantidadeLuz luzRecomendada;

    @Enumerated(EnumType.STRING)
    private QuantidadeAgua aguaRecomendada; // NOVO CAMPO ADICIONADO

    @ElementCollection
    @CollectionTable(name = "planta_solos_recomendados", joinColumns = @JoinColumn(name = "planta_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_solo")
    private Set<TipoSolo> solosRecomendados = new HashSet<>();

    public Planta() { }

    public String getNomeComum() {
        return this.nomePopular;
    }

    // Getters
    public Long getIdPlanta() { return idPlanta; }
    public String getNomePopular(){ return this.nomePopular; }
    public String getNomeCientifico(){ return this.nomeCientifico; }
    public TipoPlanta getTipoPlanta(){ return this.tipoPlanta; }
    public int getCicloMedioDias(){ return this.cicloMedioDias; }
    public String getDescricaoPlanta(){ return this.descricaoPlanta; }
    public Set<TipoSolo> getSolosRecomendados() { return this.solosRecomendados; }
    public QuantidadeLuz getLuzRecomendada() { return luzRecomendada; }
    public QuantidadeAgua getAguaRecomendada() { return aguaRecomendada; } // Getter Água
    public boolean isExcluido() { return excluido; }

    // Setters
    public void setIdPlanta(Long idPlanta) { this.idPlanta = idPlanta; }
    public void setNomePopular(String nomePopular) { this.nomePopular = nomePopular; }
    public void setNomeCientifico(String nomeCientifico){ this.nomeCientifico = nomeCientifico; }
    public void setTipoPlanta(TipoPlanta tipoPlanta){ this.tipoPlanta = tipoPlanta; }
    public void setCicloMedioDias(int cicloMedioDias){ this.cicloMedioDias = cicloMedioDias; }
    public void setDescricaoPlanta(String descricaoPlanta){ this.descricaoPlanta = descricaoPlanta; }
    public void setSolosRecomendados(Set<TipoSolo> solosRecomendados) { this.solosRecomendados = solosRecomendados; }
    public void setLuzRecomendada(QuantidadeLuz luzRecomendada) { this.luzRecomendada = luzRecomendada; }
    public void setAguaRecomendada(QuantidadeAgua aguaRecomendada) { this.aguaRecomendada = aguaRecomendada; } // Setter Água
    public void setExcluido(boolean excluido) { this.excluido = excluido; }
}