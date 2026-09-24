class Personagens{
    name: string;
    classes: string;
    description: string;
    life: number;
    namehability: string;
    hability: number;
    attack: number;
    defense: number;
    constructor(nome: string,vida: number, tipo: string, descricao: string, habilidade: number, nomehabilidade: string, ataque: number,defesa: number){
        this.name = nome
        this.life = vida
        this.hability = habilidade
        this.namehability = nomehabilidade
        this.attack = ataque
        this.defense = defesa
        this.description = descricao
        this.classes = tipo
    }
    fichapersonagem(): string{
        let dadosJogador = JSON.stringify(this)
        return dadosJogador
    }
    
    
}
class Inimigo extends Personagens {


    constructor(nome: string,vida: number, tipo: string, descricao: string, habilidade: number, nomehabilidade: string, ataque: number,defesa: number){
         super(nome, vida, tipo, descricao, habilidade, nomehabilidade, ataque, defesa); 
    }
    ataqueBasico (alvo: Personagens): void{
        alvo.life -= this.attack
    }
     magiaUm (alvo: Personagens): void{
        alvo.life -= this.hability
    }
    
    acaoInimigo(alvo: Personagens) {
        let probabilidades = [
            (alvo: Personagens) => this.ataqueBasico(alvo),
            (alvo: Personagens) => this.magiaUm(alvo),
        ]
        let acao = probabilidades[Math.floor(Math.random() * 10)](alvo)
    }


}

class Npc extends Personagens {
     meeting: string;

     constructor(nome: string,vida: number, tipo: string, descricao: string, habilidade: number, nomehabilidade: string, ataque: number,defesa: number){
         super(nome, vida, tipo, descricao, habilidade, nomehabilidade, ataque, defesa); 
         this
    }

}
