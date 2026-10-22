import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.metadatacenter.model.validation.CedarValidator;
import org.metadatacenter.model.validation.report.ValidationReport;
import org.metadatacenter.artifacts.model.reader.JsonArtifactReader;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

/** JSONL test oracle. Both real Java libraries are mandatory; nothing is stubbed or normalized. */
class CedarSchemaOracle {
  public static void main(String[] args) throws Exception {
    PrintStream protocol = new PrintStream(new FileOutputStream(FileDescriptor.out), true, StandardCharsets.UTF_8);
    System.setOut(System.err);
    ObjectMapper mapper = new ObjectMapper();
    CedarValidator validator = new CedarValidator();
    JsonArtifactReader reader = new JsonArtifactReader();
    ObjectNode hello = mapper.createObjectNode();
    hello.put("java", Runtime.version().feature());
    ObjectNode hashes = hello.putObject("schemas");
    for (String name : new String[]{"template", "element", "literal-field", "iri-field", "static-field", "multi-instance-field"}) {
      String file = name + "-meta-schema.json";
      try (InputStream stream = CedarValidator.class.getResourceAsStream("/" + file)) {
        if (stream == null) throw new IllegalStateException("Missing canonical schema: " + file);
        hashes.put(file, HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(stream.readAllBytes())));
      }
    }
    protocol.println(mapper.writeValueAsString(hello));
    BufferedReader input = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
    for (String line; (line = input.readLine()) != null;) {
      JsonNode request = mapper.readTree(line);
      ObjectNode answer = mapper.createObjectNode();
      answer.set("seq", request.get("seq"));
      try {
        String kind = request.path("kind").asText();
        JsonNode artifact = request.get("artifact");
        ValidationReport report = switch (kind) {
          case "template" -> validator.validateTemplate(artifact);
          case "element" -> validator.validateTemplateElement(artifact);
          case "field" -> validator.validateTemplateField(artifact);
          default -> throw new IllegalArgumentException("Unknown kind: " + kind);
        };
        answer.put("canSave", report.canSave());
        answer.put("isValid", report.isValid());
        answer.set("errors", mapper.valueToTree(report.getErrors()));
        answer.set("warnings", mapper.valueToTree(report.getWarnings()));
        try {
          ObjectNode copy = ((ObjectNode) artifact).deepCopy();
          switch (kind) {
            case "template" -> reader.readTemplateSchemaArtifact(copy);
            case "element" -> reader.readElementSchemaArtifact(copy);
            case "field" -> reader.readFieldSchemaArtifact(copy);
          }
          answer.put("readable", true);
        } catch (Exception error) {
          answer.put("readable", false);
          answer.put("readerError", error.toString());
        }
      } catch (Exception error) {
        answer.put("exception", error.toString());
      }
      protocol.println(mapper.writeValueAsString(answer));
    }
  }
}
