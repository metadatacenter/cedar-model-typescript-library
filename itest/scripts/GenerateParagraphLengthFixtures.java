import com.fasterxml.jackson.databind.ObjectMapper;
import org.metadatacenter.artifacts.model.core.TextAreaField;
import org.metadatacenter.artifacts.model.reader.JsonArtifactReader;
import org.metadatacenter.artifacts.model.reader.YamlArtifactReader;
import org.metadatacenter.artifacts.model.renderer.JsonArtifactRenderer;
import org.metadatacenter.artifacts.model.renderer.YamlArtifactRenderer;
import java.nio.file.Path;

/** Generate the TypeScript paragraph oracle with Java, without changing the shared corpus.
 * Run from the model TypeScript repository with Java 17:
 * java -cp <cedar-artifact-library-jar-with-dependencies.jar> itest/scripts/GenerateParagraphLengthFixtures.java
 */
class GenerateParagraphLengthFixtures {
  public static void main(String[] args) throws Exception {
    var mapper = new ObjectMapper();
    var jsonWriter = new JsonArtifactRenderer();
    var entries = mapper.createArrayNode();
    Integer[][] bounds = {{null, null}, {0, 0}, {20, null}, {null, 500}, {20, 500}};
    for (var pair : bounds) {
      var builder = TextAreaField.builder().withName("Paragraph").withDescription("A paragraph");
      if (pair[0] != null) builder.withMinLength(pair[0]);
      if (pair[1] != null) builder.withMaxLength(pair[1]);
      if (Integer.valueOf(20).equals(pair[0])) builder.withDefaultValue("A sufficiently long paragraph.");
      var field = builder.build();
      var json = jsonWriter.renderFieldSchemaArtifact(field);
      if (!json.equals(jsonWriter.renderFieldSchemaArtifact(new JsonArtifactReader().readFieldSchemaArtifact(json))))
        throw new AssertionError("Java JSON round trip changed paragraph constraints");
      var entry = entries.addObject();
      entry.set("minLength", mapper.valueToTree(pair[0]));
      entry.set("maxLength", mapper.valueToTree(pair[1]));
      entry.set("json", json);
      for (boolean compact : new boolean[] {false, true}) {
        var writer = new YamlArtifactRenderer(compact);
        var yaml = writer.renderFieldSchemaArtifact(field);
        var restored = new YamlArtifactReader(compact).readFieldSchemaArtifact(yaml);
        if (!yaml.equals(writer.renderFieldSchemaArtifact(restored)))
          throw new AssertionError("Java YAML round trip changed paragraph constraints");
        entry.set(compact ? "compactYaml" : "yaml", mapper.valueToTree(yaml));
      }
    }
    mapper.writerWithDefaultPrettyPrinter().writeValue(
      Path.of("itest/resources/concordance/java-paragraph-lengths.json").toFile(), entries);
  }
}
