import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

type Personagem = {
  nome: string;
  vidaAtual: number;
  vidaMaxima: number;
  ataque: number;
  defesa: number;
};

export default function App() {
  const [jogador, setJogador] = useState<Personagem>({
    nome: 'Guerreiro Claude',
    vidaAtual: 100,
    vidaMaxima: 100,
    ataque: 25,
    defesa: 10,
  });

  const [inimigo, setInimigo] = useState<Personagem>({
    nome: 'Dragão de Código',
    vidaAtual: 120,
    vidaMaxima: 120,
    ataque: 22,
    defesa: 15,
  });

  const [historico, setHistorico] = useState<string>('Sua vez! Escolha uma ação.');
  const [turnoDoJogador, setTurnoDoJogador] = useState<boolean>(true);

  // FUNÇÃO: Faz o inimigo atacar de volta de forma automática
  const executarTurnoDoInimigo = (vidaAtualizadaInimigo: number) => {
    // Se o inimigo morreu, não faz nada (Evita que o monstro ataque depois de morto)
    if (vidaAtualizadaInimigo <= 0) return;

    setTimeout(() => {
      let danoDoInimigo = inimigo.ataque - jogador.defesa;
      if (danoDoInimigo < 1) danoDoInimigo = 1;

      setJogador((dadosAntigos) => {
        const novaVida = Math.max(0, dadosAntigos.vidaAtual - danoDoInimigo);
        return { ...dadosAntigos, vidaAtual: novaVida };
      });

      setHistorico(`🔥 ${inimigo.nome} cuspiu fogo e causou ${danoDoInimigo} de dano em você!`);
      setTurnoDoJogador(true);
    }, 1500);
  };

  const atacarInimigo = () => {
    let danoCausado = jogador.ataque - inimigo.defesa;
    if (danoCausado < 1) danoCausado = 1;

    const novaVidaInimigo = Math.max(0, inimigo.vidaAtual - danoCausado);

    setInimigo((dadosAntigos) => ({
      ...dadosAntigos,
      vidaAtual: novaVidaInimigo,
    }));

    setHistorico(`⚔️ ${jogador.nome} atacou ${inimigo.nome} e causou ${danoCausado} de dano!`);
    setTurnoDoJogador(false);

    executarTurnoDoInimigo(novaVidaInimigo);
  };

  const curarJogador = () => {
    const pontosCura = 30;
    const novaVidaJogador = Math.min(jogador.vidaMaxima, jogador.vidaAtual + pontosCura);

    setJogador((dadosAntigos) => ({
      ...dadosAntigos,
      vidaAtual: novaVidaJogador,
    }));

    setHistorico(`❤️ ${jogador.nome} usou magia de cura e recuperou ${pontosCura} de HP!`);
    setTurnoDoJogador(false);

    executarTurnoDoInimigo(inimigo.vidaAtual);
  };

  // NOVO - FUNÇÃO: Reseta o jogo para o estado inicial
  const reiniciarJogo = () => {
    setJogador((antigo) => ({ ...antigo, vidaAtual: antigo.vidaMaxima }));
    setInimigo((antigo) => ({ ...antigo, vidaAtual: antigo.vidaMaxima }));
    setHistorico('Nova batalha iniciada! Sua vez.');
    setTurnoDoJogador(true);
  };

  // NOVO - Variáveis de verificação para saber se o jogo acabou
  const vitoria = inimigo.vidaAtual <= 0;
  const derrota = jogador.vidaAtual <= 0;
  const jogoAcabou = vitoria || derrota;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ÁREA DO TOPO: Inimigo */}
      <View style={styles.areaInimigo}>
        <Text style={styles.emojiGeral}>{vitoria ? '💀' : '🐲'}</Text>
        <Text style={styles.nomeInimigo}>{inimigo.nome}</Text>
        <View style={styles.barraVidaFundo}>
          <View style={[styles.barraVidaInimigo, { width: `${(inimigo.vidaAtual / inimigo.vidaMaxima) * 100}%` }]} />
        </View>
        <Text style={styles.textoVida}>{inimigo.vidaAtual} / {inimigo.vidaMaxima} HP</Text>
      </View>

      {/* ÁREA DO MEIO: Caixa de Histórico de Mensagens */}
      <View style={styles.caixaHistorico}>
        <Text style={styles.textoHistorico}>{historico}</Text>
      </View>

      {/* ÁREA DO MEIO/BAIXO: Jogador */}
      <View style={styles.areaJogador}>
        <Text style={styles.emojiGeral}>{derrota ? '🪦' : '⚔️'}</Text>
        <Text style={styles.nomeJogador}>{jogador.nome}</Text>
        <View style={styles.barraVidaFundo}>
          <View style={[styles.barraVidaJogador, { width: `${(jogador.vidaAtual / jogador.vidaMaxima) * 100}%` }]} />
        </View>
        <Text style={styles.textoVida}>{jogador.vidaAtual} / {jogador.vidaMaxima} HP</Text>
      </View>

      {/* ÁREA DA BASE: Renderização Condicional */}
      {/* Se o jogo acabou, exibe a tela de Fim de Jogo. Caso contrário, exibe os botões normais */}
      {jogoAcabou ? (
        <View style={styles.caixaFimJogo}>
          <Text style={styles.textoFimJogo}>
            {vitoria ? '🎉 Você Venceu!' : '💀 Fim de Jogo!'}
          </Text>
          <TouchableOpacity style={styles.botaoReiniciar} onPress={reiniciarJogo}>
            <Text style={styles.textoBotao}>🔄 Jogar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.areaBotoes}>
          <TouchableOpacity 
            style={[styles.botao, styles.botaoAtacar, !turnoDoJogador && styles.botaoDesativado]} 
            activeOpacity={0.7}
            onPress={atacarInimigo}
            disabled={!turnoDoJogador}
          >
            <Text style={styles.textoBotao}>⚔️ Atacar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.botao, styles.botaoCurar, !turnoDoJogador && styles.botaoDesativado]} 
            activeOpacity={0.7}
            onPress={curarJogador}
            disabled={!turnoDoJogador}
          >
            <Text style={styles.textoBotao}>❤️ Curar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151517',
    paddingTop: 50,
    paddingBottom: 30,
  },
  areaInimigo: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#221515',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4a1515',
  },
  caixaHistorico: {
    backgroundColor: '#2c2c2e',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3c',
    alignItems: 'center',
  },
  textoHistorico: {
    color: '#e5e5ea',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  areaJogador: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151c22',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#15354a',
  },
  emojiGeral: {
    fontSize: 40,
    marginBottom: 5,
  },
  nomeInimigo: {
    color: '#ff6b6b',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nomeJogador: {
    color: '#4dadff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  barraVidaFundo: {
    width: '70%',
    height: 14,
    backgroundColor: '#333',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 5,
  },
  barraVidaInimigo: {
    height: '100%',
    backgroundColor: '#e63946',
  },
  barraVidaJogador: {
    height: '100%',
    backgroundColor: '#2a9d8f',
  },
  textoVida: {
    color: '#fff',
    fontSize: 14,
  },
  areaBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 10,
  },
  botao: {
    width: '40%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoAtacar: {
    backgroundColor: '#e63946',
  },
  botaoCurar: {
    backgroundColor: '#2a9d8f',
  },
  botaoDesativado: {
    backgroundColor: '#3a3a3c',
    opacity: 0.5,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // NOVO - Estilos para a tela de fim de jogo
  caixaFimJogo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  textoFimJogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  botaoReiniciar: {
    backgroundColor: '#4dadff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
});