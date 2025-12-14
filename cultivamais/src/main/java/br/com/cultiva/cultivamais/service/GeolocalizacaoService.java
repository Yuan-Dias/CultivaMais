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
import java.util.Map;

@Service
public class GeolocalizacaoService {

    @Autowired
    private AreaCultivoRepository areaCultivoRepository;

    // Classe interna para representar os dados processados
    public static class DadosSolares {
        public double incidenciaSolarMedia; // Parâmetro: ALLSKY_SFC_SW_DWN
        public double umidadeMedia;         // Parâmetro: RH2M
    }

    @SuppressWarnings("null")
    public DadosSolares buscarDadosExternos(@NonNull Long idAreaCultivo) {
        // 1. Buscar a área no banco
        AreaCultivo area = areaCultivoRepository.findById(idAreaCultivo)
                .orElseThrow(() -> new ResourceNotFoundException("Área não encontrada para geolocalização com ID: " + idAreaCultivo));

        double lat = area.getLatitudeArea();
        double lon = area.getLongitudeArea();

        // 2. Definir datas (Pegamos a média dos últimos 7 dias para ter dados recentes)
        LocalDate hoje = LocalDate.now();
        LocalDate seteDiasAtras = hoje.minusDays(8); // NASA tem um delay de 2-3 dias, então pegamos um range seguro
        LocalDate umDiaAtras = hoje.minusDays(2);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String start = seteDiasAtras.format(formatter);
        String end = umDiaAtras.format(formatter);

        // 3. Montar a URL da NASA POWER API
        // Community: AG (Agroclimatology)
        // Parameters: ALLSKY_SFC_SW_DWN (Incidência Solar), RH2M (Umidade a 2 metros)
        String url = String.format(
                "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,RH2M&community=AG&longitude=%s&latitude=%s&start=%s&end=%s&format=JSON",
                lon, lat, start, end
        );

        System.out.println("Consultando API NASA: " + url);

        try {
            // 4. Fazer a requisição HTTP
            RestTemplate restTemplate = new RestTemplate();
            String jsonResponse = restTemplate.getForObject(url, String.class);

            // 5. Parsear (Ler) o JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonResponse);

            // Navegar até os dados: properties -> parameter
            JsonNode parameters = root.path("properties").path("parameter");

            // Calcular médias
            double mediaSolar = calcularMediaDoJson(parameters.path("ALLSKY_SFC_SW_DWN"));
            double mediaUmidade = calcularMediaDoJson(parameters.path("RH2M"));

            DadosSolares dados = new DadosSolares();
            dados.incidenciaSolarMedia = Math.round(mediaSolar * 100.0) / 100.0; // Arredondar 2 casas
            dados.umidadeMedia = Math.round(mediaUmidade * 10.0) / 10.0;       // Arredondar 1 casa

            return dados;

        } catch (Exception e) {
            // Fallback (Plano B): Se a API falhar ou demorar, retorna dados padrão para não quebrar o front
            System.err.println("Erro ao consultar NASA API: " + e.getMessage());
            e.printStackTrace();

            DadosSolares dadosFallback = new DadosSolares();
            dadosFallback.incidenciaSolarMedia = 5.5; // Média Brasil
            dadosFallback.umidadeMedia = 60.0;
            return dadosFallback;
        }
    }

    // Método auxiliar para varrer o JSON de datas e fazer a média
    private double calcularMediaDoJson(JsonNode nodeDatas) {
        if (nodeDatas.isMissingNode()) return 0.0;

        double soma = 0.0;
        int conta = 0;

        Iterator<Map.Entry<String, JsonNode>> fields = nodeDatas.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            double valor = entry.getValue().asDouble();

            // A NASA retorna -999 quando não tem dados para aquele dia
            if (valor != -999.0 && valor >= 0) {
                soma += valor;
                conta++;
            }
        }

        return conta > 0 ? soma / conta : 0.0;
    }
}