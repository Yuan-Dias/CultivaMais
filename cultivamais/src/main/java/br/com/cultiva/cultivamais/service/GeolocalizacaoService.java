package br.com.cultiva.cultivamais.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import br.com.cultiva.cultivamais.model.*;
import br.com.cultiva.cultivamais.repository.AreaCultivoRepository;
import io.micrometer.common.lang.NonNull;

@Service
public class GeolocalizacaoService {

    @Autowired
    private AreaCultivoRepository areaCultivoRepository;

    public static class DadosSolares {
        public double incidenciaSolarMedia;
        public double umidadeMedia;
    }

    @SuppressWarnings("null")
    public DadosSolares buscarDadosExternos(@NonNull Long idAreaCultivo) {

        AreaCultivo area = areaCultivoRepository.findById(idAreaCultivo).orElse(null);

        if(area == null) {
            System.err.println("Área com ID "+ idAreaCultivo +" não encontrada.");
            return null;
        }

        double latitudeArea = area.getLatitudeArea();
        double longitudeArea = area.getLongitudeArea();

        // 1. LÓGICA (FUTURA) DE HTTP:
        // Aqui, você usaria uma biblioteca (como Spring RestTemplate)
        // para fazer uma chamada para a API da NASA, ex:
        // "https://power.larc.nasa.gov/api/..." + latitude + "," + longitude

        // 2. LÓGICA (FUTURA) DE PARSE:
        // Aqui, você pegaria a resposta JSON da NASA e a
        // transformaria em um objeto 'DadosSolares'.

        System.out.println("Buscando dados para: " + latitudeArea + ", " + longitudeArea);

        DadosSolares dados = new DadosSolares();
        dados.incidenciaSolarMedia = 5.5;
        dados.umidadeMedia = 65.0;
        
        return dados;
    }
}
