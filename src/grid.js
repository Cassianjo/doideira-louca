//class Grid {
   // constructor(tamX, tamY) {
   //     this.largura = tamX
    //    this.altura = tamY
    //    this.grid = []
     //   for (let y = 0; y < tamY; y++) {
     //       this.grid.push([])
      //      for (let x = 0; x < tamX; x++) {
      //          grid[y].push(0)
       //     }    
     //   }
   // }
//}

//class Player {
   // constructor(nome, ataque, defesa, vida, estamina){
  /*      this.name = nome
        this.atack = ataque
        this.defense = defesa
        this.life = vida
        this.stamina = estamina
    }
    andar(grid) {}
}


const gridJogo = new Grid(12, 8)
const negoney = new Player("nego ney", 10000, 42424, 666, 777)
//function GridFrontend({grid}) {
    
    
   // const resultado = <View>
  //      {grid.map()}
  //  </View>
//}

y = 7
x = 10

grid[linha][coluna]
grid[2][7] = 1


VAZIO = 0
PLAYER = 1
INIMIGO = 2
PROJETIL_JOGADOR = 4
PROJETIL_INIMIGO = 7

const acoes = [
    nada(),
    acao_jogador(),
    acao_inimigo(),
    null,
    null,
    null,
    null,
    null,
    jogador_dano(),
]

const atividades

acoes[PLAYER + PROJETIL_INIMIGO]

[
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
]*/

class Grid {
  constructor(tamX, tamY) {
    this.largura = tamX;
    this.altura = tamY;
    this.grid = [];

    for (let y = 0; y < tamY; y++) {
      this.grid.push(new Array(tamX).fill(0));
    }
  }

  // Acesso seguro com validação de limites
  get(x, y) {
    if (x < 0 || x >= this.largura || y < 0 || y >= this.altura) return null;
    return this.grid[y][x];
  }

  set(x, y, valor) {
    if (x < 0 || x >= this.largura || y < 0 || y >= this.altura) return false;
    this.grid[y][x] = valor;
    return true;
  }

  // Limpa a célula
  clear(x, y) {
    return this.set(x, y, Grid.VAZIO);
  }

  // Debug: imprime a grid no console
  print() {
    console.log(this.grid.map(row => row.join(' ')).join('\n'));
  }
}

// Constantes na própria classe (mais organizado que variáveis soltas)
Grid.VAZIO            = 0;
Grid.PLAYER           = 1;
Grid.INIMIGO          = 2;
Grid.PROJETIL_JOGADOR = 4;
Grid.PROJETIL_INIMIGO = 7;

class Player {
  constructor(nome, ataque, defesa, vida, estamina) {
    this.name = nome;
    this.attack = ataque;      // corrigi "atack"
    this.defense = defesa;
    this.life = vida;
    this.stamina = estamina;
    this.x = 0;
    this.y = 0;
  }

  // Move o jogador e atualiza a grid
  andar(grid, dx, dy) {
    const novoX = this.x + dx;
    const novoY = this.y + dy;

    // Verifica se a célula destino está livre
    const destino = grid.get(novoX, novoY);
    if (destino === null || destino !== Grid.VAZIO) return false;

    // Limpa posição antiga e marca a nova
    grid.set(this.x, this.y, Grid.VAZIO);
    this.x = novoX;
    this.y = novoY;
    grid.set(this.x, this.y, Grid.PLAYER);
    return true;
  }

  // Coloca o jogador na grid
  spawn(grid, x, y) {
    if (grid.set(x, y, Grid.PLAYER)) {
      this.x = x;
      this.y = y;
    }
  }
}
const gridJogo = new Grid(12, 8);
const negoney = new Player("nego ney", 10000, 42424, 666, 777);

negoney.spawn(gridJogo, 5, 3);
negoney.andar(gridJogo, 1, 0);  // move para direita
negoney.andar(gridJogo, 0, 1);  // move para baixo

gridJogo.print();