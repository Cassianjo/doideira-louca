import { useState } from "react";
import { Modal, ScrollView, Text, TextInput, View } from "react-native";
import { useGame } from "../store";
import { Button, palette, Rule, ui } from "./UI";
import PixelSprite from "./PixelSprite";
export default function Menu() {
  const g = useGame();
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState(false);
  return (
    <View style={{ gap: 20 }}>
      <Text style={ui.label}>SUA PRÓXIMA AVENTURA</Text>
      <Text style={[ui.title, { fontSize: 34, lineHeight: 44 }]}>
        Toda grande jornada{"\n"}começa com uma brasa.
      </Text>
      <Text style={[ui.muted, { maxWidth: 420, lineHeight: 24 }]}>
        Entre no bosque. Encontre seu caminho. Mantenha a chama acesa.
      </Text>
      <View style={[ui.panel, { marginTop: 12, gap: 18 }]}>
        <View style={ui.row}>
          <PixelSprite kind="flame" size={3} />
          <View style={{ flex: 1 }}>
            <Text style={[ui.text, { fontSize: 16 }]}>
              {g.username
                ? `Bem-vindo, ${g.username}`
                : "Quem carrega a chama?"}
            </Text>
            <Text style={ui.muted}>
              {g.username
                ? "Seu próximo capítulo está esperando."
                : "Seu username é a chave da sua jornada."}
            </Text>
          </View>
          <Text style={{ color: palette.gold }}>✦</Text>
        </View>
        <Rule label={g.username ? "SEU PROGRESSO" : "IDENTIFIQUE-SE"} />
        {!g.username ? (
          <>
            <Text style={ui.label}>USERNAME</Text>
            <TextInput
              accessibilityLabel="Username"
              placeholder="Ex.: aventureiro_01"
              placeholderTextColor="#716a7c"
              autoCapitalize="none"
              autoCorrect={false}
              value={name}
              onChangeText={setName}
              maxLength={20}
              onSubmitEditing={() => g.login(name)}
              style={[
                ui.text,
                {
                  padding: 16,
                  borderWidth: 1,
                  borderColor: palette.line,
                  backgroundColor: "#19181f",
                  outlineWidth: 0,
                } as any,
              ]}
            />
            <Button
              primary
              disabled={g.busy || name.trim().length < 3}
              onPress={() => g.login(name)}
            >
              {g.busy ? "Conectando…" : "Entrar na jornada   →"}
            </Button>
            <Text style={[ui.muted, { fontSize: 10 }]}>
              3–20 letras, números ou _. Sem senha: qualquer pessoa com esse
              username pode acessar o perfil.
            </Text>
          </>
        ) : (
          <>
            <View style={[ui.row, { justifyContent: "space-between" }]}>
              {[
                ["NÍVEL", String(1 + Math.floor(g.progress.victories / 3))],
                ["VITÓRIAS", String(g.progress.victories)],
                ["OURO", String(g.progress.gold)],
              ].map(([label, value]) => (
                <View key={label} style={{ gap: 8 }}>
                  <Text style={ui.label}>{label}</Text>
                  <Text style={[ui.title, { fontSize: 22 }]}>{value}</Text>
                </View>
              ))}
            </View>
            <Button primary onPress={() => g.go("world")}>
              Continuar aventura →
            </Button>
            <Button onPress={() => setConfirm(true)}>Nova jornada</Button>
            <Button onPress={() => g.go("guide")}>Como jogar</Button>
            <Text style={[ui.muted, { fontSize: 10 }]}>
              Último save:{" "}
              {g.saved
                ? new Date(g.saved).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })
                : "ainda não salvo"}
            </Text>
          </>
        )}
        {!!g.message && (
          <Text
            accessibilityRole="alert"
            style={[ui.muted, { color: palette.gold }]}
          >
            {g.message}
          </Text>
        )}
      </View>
      <View style={[ui.row, { justifyContent: "space-between" }]}>
        <Text style={ui.muted}>UM RPG SOBRE NÃO DESISTIR.</Text>
        <Text style={ui.label}>v. 0.1</Text>
      </View>
      <Modal
        transparent
        visible={confirm}
        onRequestClose={() => setConfirm(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#000b",
            justifyContent: "center",
            padding: 30,
          }}
        >
          <View
            style={[ui.panel, { gap: 18, maxWidth: 440, alignSelf: "center" }]}
          >
            <Text style={ui.title}>Recomeçar?</Text>
            <Text style={ui.muted}>
              Seu progresso atual será substituído quando você salvar a nova
              jornada.
            </Text>
            <Button
              primary
              onPress={() => {
                setConfirm(false);
                g.newGame();
              }}
            >
              Começar de novo
            </Button>
            <Button onPress={() => setConfirm(false)}>Voltar</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
