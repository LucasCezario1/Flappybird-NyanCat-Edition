function novoElemento(tagName, className) { // Função responsável por criar os elementos no HTML e aplicar os estilos CSS neles
    const elem = document.createElement(tagName) // cria um elemento no HTML à partir do nome da tag
    elem.className = className // adiciona a classe CSS para esse elemento
    return elem // retorna o elemento criado
}

function Barreira(reversa = false) { // função construtora para criar barreiras
    this.elemento = novoElemento('div', 'barreira') // cria um elemento div com classe barreira

    const borda = novoElemento('div', 'borda') // cria um elemento div com classe borda
    const corpo = novoElemento('div', 'corpo') // cria um elemento div com classe corpo
    this.elemento.appendChild(reversa ? corpo : borda) // reversa == true, acrescenta corpo // reversa == false, acrescenta borda
    this.elemento.appendChild(reversa ? borda : corpo) // reversa == true, acrescenta borda // reversa == false, acrescenta corpo

    this.setAltura = altura => corpo.style.height = `${altura}px` // função que seta a altura do corpo das barreiras
}



function ParDeBarreiras(altura, abertura, x) { // função construtora para criar o par de barreiras
    this.elemento = novoElemento('div', 'par-de-barreiras') // cria um elemento div com classe par-de-barreiras
    
    this.superior = new Barreira(true) // cria uma nova barreira reversa à partir da função construtora Barreira
    this.inferior = new Barreira(false) // cria uma nova barreira não-reversa à partir da função construtora Barreira

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura) // calcula a altura do cano superior de forma aleatória
        const alturaInferior = altura - abertura - alturaSuperior // calcula a altura do cano inferior, se baseando no valor gerado do cano superior
        this.superior.setAltura(alturaSuperior) // aplica a altura para superior com a função setAltura
        this.inferior.setAltura(alturaInferior) // aplica a altura para inferior com a função setAltura
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]) // função que pega a posição atual de x
    this.setX = x => this.elemento.style.left = `${x}px` // função que altera a posição x
    this.getLargura = () => this.elemento.clientWidth // clientWidth pega a largura do elemento, incluindo padding, mas não incluindo bordas

    this.sortearAbertura()
    this.setX(x)
}


function Barreiras(altura, largura, abertura, espaco, notificarPonto) { // função construtora para adicionar a animação das barreiras
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura), // a primeiras barreira ficará inicialmente fora do jogo
        new ParDeBarreiras(altura, abertura, largura + espaco), // segunda barreira virá depois da primeira + o espaço definido
        new ParDeBarreiras(altura, abertura, largura + espaco * 2), // terceira barreira virá depois da segunda + o espaço
        new ParDeBarreiras(altura, abertura, largura + espaco * 3) // quarta barreira virá depois da terceira + o espaço
    ]

    const deslocamento = 3 // deslocamento das barreiras 

    this.animar = () => { // função responsável por fazer o deslocamento das barreiras
        this.pares.forEach(par => { // acessa cada barreira do array pares
            par.setX(par.getX() - deslocamento)
           
           
            if(par.getX() < -par.getLargura()) { 
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura() 
                // sorteia a abertura da barreira para aparecer em uma posição diferente e dar a sensação de que são novas barreiras
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio 
                && par.getX() < meio // verifica se passou o meio, retornando true ou false para cruzouOMeio
            if(cruzouOMeio) notificarPonto() // se verdadeiro, conta um ponto
            // cruzouOMeio && notificarPonto() // funciona da mesma forma que o if, mas de uma forma mais "obscura"
        })
    }
}

// Andiconar o Passaro ao jogo
function Passaro(alturaJogo) { // função construtora para adicionar o pássaro e sua animação no jogo
    let voando = false // voando é a variável responsável por dizer se a tecla está presionada ou não

    this.elemento = novoElemento('img', 'passaro') // cria um elemento img com classe passaro
    this.elemento.src = './imgs/NyanCat.png' // adiciona o caminho da imagem
     

     /*this.elemento = novoElemento('gif' , 'jazz')
     this.elemento.src = '/imgs/jazz.gif'*/
        

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
   
    this.setY = y => this.elemento.style.bottom = `${y}px` // função que altera a posição y

    /**precionar a tecla para personagem voar */
    window.onkeydown = e => voando = true // quando clicar em qualquer tecla e tiver pressionada, voando será setado para true
    window.onkeyup = e => voando = false // quando soltar a tecla, voando será false

    this.animar = () => { // função que fará o pássaro(gato) "voar"
        const novoY = this.getY() + (voando ? 8 : -5) // se voando for true, incrementa 8 na altura do pássaro, caso contrário, decrementa 5
        const alturaMaxima = alturaJogo - this.elemento.clientHeight // faz o cálculo da altura máxima para que o pássaro não passe da tela
        // clientHeight é a altura do pássaro

        if (novoY <= 0) { // verificação para fazer com que o pássaro não passe do chão do jogo
            this.setY(0)
        } else if (novoY >= alturaMaxima) { // verificação para fazer com que o passaro não passe do teto do jogo
            this.setY(alturaMaxima)
        } else { // se ele não passou do teto, nem do chão, seta a posição atual dele
            this.setY(novoY)
        }
    }
    
    this.setY(alturaJogo / 2) // altura inicial do pássaro
}


// progreso de pontuacao
function Progresso() { // função construtora para criar o progresso do jogo e iniciá-lo com 0 e atualizar os pontos de progresso
    this.elemento = novoElemento('span', 'progresso') // cria um elemento span com classe progresso
    
    this.atualizarPontos = pontos => { // função que irá atualizar os pontos na tela do jogo
        this.elemento.innerHTML = pontos // sempre vai adicionar no elemento (span) a nova pontuação
    }
    
    this.atualizarPontos(0) // Inicia o jogo com 0 pontos
}


// funcao que verifica se há colisão
function estaoSobrepostos(elementoA, elementoB) { 
    const a = elementoA.getBoundingClientRect() // getBoundingClientRect é o retângulo associado ao elemento a
    const b = elementoB.getBoundingClientRect() // getBoundingClientRect é o retângulo associado ao elemento b
    // Com as duas constantes, podemos calcular se há ou não sobreposição nesses dois eixos, verificando dessa forma se há colisão

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
  
    return horizontal && vertical 
    
}

function colidiu(passaro, barreiras) { // função responsável por testar a colisão entre o pássaro e as barreiras
    let colidiu = false // quando houver colisão, esta variável será setada para true

    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu) { // só entra neste if se não tiver colidido ainda
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento

            // verifica se houve colisão entre os pássaro e uma das duas barreiras de cada par de barreiras
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
            // caso haja colisão com uma das barreiras do par de barreiras, variável colidiu é setada para true
        }
    })
    return colidiu  // caso o retorno seja true, o jogo "acaba" (Game Over)
}

// funcao para fazer gamer over e resert do jogo
function GameOver() {
    this.elemento = novoElemento('span', 'game-over')
    this.elemento.innerHTML = 'Game Over' // insere a mensagem no HTML
}

function RestartMessage() {
    this.elemento = novoElemento('span', 'restart')
    this.elemento.innerHTML = 'Pressione F5 para Resetar' // insere a mensagem no HTML
}

// PONTOS FINAIS quando da game over
function pontosFinais(){
    his.elemento = novoElemento('span', 'progressoFinal')
    this.elemento.innerHTML = `Pontuacao final:${atualizarPontos}` // mostrando a pontuacao do jogo no final
}


function FlappyBird() { // função que representará o jogo, criado todas as instâncias das funções contrutoras e adiocionando-as à área do jogo
    let pontos = 0 // variável que representa os pontos, iniciada com 0 para condizer com o ínicio do jogo

    const areaDoJogo = document.querySelector('[wm-flappy]') // seleciona a area do jogo
    const altura = areaDoJogo.clientHeight // armazena a altura da area do jogo
    const largura = areaDoJogo.clientWidth // armazena a largura da area do jogo

    const progresso = new Progresso()
    const passaro = new Passaro(altura)
    const fimJogo = new GameOver()
    const restart = new RestartMessage()
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))
    // essa última função vai passar um ponto incrementado toda vez, atualizando a variável também dessa forma
    

    // Adicionando os elementos para o jogo...
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) { // verifica se houve colisão entre passaro e barreiras
                clearInterval(temporizador) // se houve colisão, para-se o temporizador e consequentemente o jogo
                areaDoJogo.appendChild(fimJogo.elemento) // acrescenta a mensagem de Game Over no html tela inicial
                areaDoJogo.appendChild(restart.elemento) // acrescenta a mensagem de Restart no html tela inicial
                areaDoJogo.appendChild(atualizarPontos) // atualizacao de pontos
            }
        }, 20)
    }
}

new FlappyBird().start() // dá o start no jogo chamando a função start, responsável por "animar" com o temporizador