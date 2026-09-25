import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.metadatacenter.artifacts.model.core.TextField;
import org.metadatacenter.artifacts.model.tools.YamlSerializer;

/** Companion to verify-yaml-escapes.ts; uses the supplied, built Java artifact library. */
class VerifyYamlEscapes {
  public static void main(String[] args) throws Exception {
    ObjectMapper json = new ObjectMapper();
    ObjectMapper yaml = new ObjectMapper(new YAMLFactory());
    int count = 0;
    for (JsonNode row : json.readTree(System.in)) {
      String value = row.get("value").asText();
      String javaYaml = YamlSerializer.getYAML(TextField.builder()
        .withName("Escape probe").withDescription(value).build(), false, true);
      String scalar = javaYaml.lines().filter(line -> line.startsWith("description:")).findFirst().orElseThrow() + "\n";
      if (!scalar.equals(row.get("tsYaml").asText()))
        throw new AssertionError("Java/TypeScript escape spelling differs for probe " + count);
      if (!value.equals(yaml.readTree(row.get("tsYaml").asText()).get("description").asText()))
        throw new AssertionError("Java changed TypeScript's value for probe " + count);
      JsonNode keyed = yaml.readTree(row.get("tsKeyYaml").asText());
      if (keyed.size() != 1 || !keyed.has(value) || !value.equals(keyed.get(value).asText()))
        throw new AssertionError("Java changed TypeScript's key/value for probe " + count);
      count++;
    }
    System.out.println("Java escape spelling and Java key/value preservation: " + count + " probes passed");
  }
}
