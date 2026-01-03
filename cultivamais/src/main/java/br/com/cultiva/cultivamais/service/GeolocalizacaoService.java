package br.com.cultiva.cultivamais.service;

import br.com.cultiva.cultivamais.exception.ResourceNotFoundException;
import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.repository.AreaCultivoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.common.lang.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Iterator;

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
        AreaCultivo area = areaCultivoRepository.findById(idAreaCultivo)
                .orElseThrow(() -> new ResourceNotFoundException("Área não encontrada com ID: " + idAreaCultivo));

        double lat = area.getLatitudeArea();
        double lon = area.getLongitudeArea();

        LocalDate hoje = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String start = hoje.minusDays(8).format(formatter);
        String end = hoje.minusDays(2).format(formatter);

        String url = String.format(
                "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,RH2M&community=AG&longitude=%s&latitude=%s&start=%s&end=%s&format=JSON",
                lon, lat, start, end
        );

        try {
            RestTemplate restTemplate = new RestTemplate();
            String jsonResponse = restTemplate.getForObject(url, String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonResponse);
            JsonNode parameters = root.path("properties").path("parameter");

            DadosSolares dados = new DadosSolares();
            dados.incidenciaSolarMedia = Math.round(calcularMediaDoJson(parameters.path("ALLSKY_SFC_SW_DWN")) * 100.0) / 100.0;
            dados.umidadeMedia = Math.round(calcularMediaDoJson(parameters.path("RH2M")) * 10.0) / 10.0;

            return dados;
        } catch (Exception e) {
            DadosSolares dadosFallback = new DadosSolares();
            dadosFallback.incidenciaSolarMedia = 5.5;
            dadosFallback.umidadeMedia = 60.0;
            return dadosFallback;
        }
    }

    /**
     * CORREÇÃO: Substituído fields() depreciado por elements()
     */
    private double calcularMediaDoJson(JsonNode nodeDatas) {
        if (nodeDatas == null || nodeDatas.isMissingNode()) return 0.0;

        double soma = 0.0;
        int conta = 0;

        Iterator<JsonNode> elements = nodeDatas.elements();
        while (elements.hasNext()) {
            double valor = elements.next().asDouble();
            if (valor != -999.0 && valor >= 0) {
                soma += valor;
                conta++;
            }
        }
        return conta > 0 ? soma / conta : 0.0;
    }
}