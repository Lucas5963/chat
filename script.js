console.log('Iniciando script.js...');

const firebaseConfig = {
  apiKey: "AIzaSyBc1H4dDL56w70sjCGYDZ5GApv-b845C9w", // **REMOVER EM PRODUÇÃO**
  authDomain: "chat-publico-742f8.firebaseapp.com",
  databaseURL: "https://chat-publico-742f8-default-rtdb.firebaseio.com",
  projectId: "chat-publico-742f8",
  storageBucket: "chat-publico-742f8.firebasestorage.app",
  messagingSenderId: "1002645903917",
  appId: "1:1002645903917:web:25ada52b6801d0242a36a4"
};

try {
  console.log('Inicializando Firebase...');
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase inicializado com sucesso.');
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
}

const db = firebase.database();
const auth = firebase.auth();

console.log('Elementos do DOM sendo capturados...');
const loginForm = document.getElementById('loginForm');
const form = document.getElementById('form');
const input = document.getElementById('input');
const modal = document.getElementById('modal-login');
const emailInput = document.getElementById('emailInput');
const senhaInput = document.getElementById('senhaInput');
const toggleSenhaBtn = document.getElementById('toggleSenhaBtn');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const resetSenhaBtn = document.getElementById('resetSenhaBtn');
const logoutBtn = document.getElementById('logoutBtn');
const digitandoDiv = document.getElementById('digitando');
const listaUsuarios = document.getElementById('listaUsuarios');
const messagesDiv = document.getElementById('messages');
const notificacaoAudio = document.getElementById('notificacaoAudio');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const salaSelect = document.getElementById('salaSelect');
const usuariosOnline = document.getElementById('usuariosOnline');
const chatDiv = document.getElementById('chat');
const temaBtn = document.getElementById('temaBtn');
const errorMessage = document.getElementById('errorMessage');
const errorMessageChat = document.getElementById('errorMessageChat');
const passwordChecklist = document.getElementById('passwordChecklist');
const reqLength = document.getElementById('req-length');
const reqUppercase = document.getElementById('req-uppercase');
const reqNumeric = document.getElementById('req-numeric');
const reqSpecial = document.getElementById('req-special');

let user = null;
let salaAtual = salaSelect.value;
let mensagensRef = db.ref(`mensagens/${salaAtual}`);
let digitandoRef = db.ref(`digitando/${salaAtual}`);
const usuariosOnlineRef = db.ref("usuariosOnline");

// Lista de palavras ofensivas (de palavras.txt)
const palavrasOfensivas = [
  'aidetica', 'aidetico', 'aleijada', 'aleijado', 'ana', 'analfabeta', 'analfabeto', 'anao',
  'anus', 'apenada', 'apenado', 'arrombado', 'babaca', 'babaovo', 'bacura', 'bagos',
  'baianada', 'baitola', 'barbaro', 'barbeiro', 'barraco', 'beata', 'bebado', 'bebedo',
  'bebum', 'besta', 'bicha', 'bisca', 'bixa', 'boazuda', 'bocal', 'boceta', 'boco',
  'boiola', 'bokete', 'bolagato', 'bolcat', 'boquete', 'bosseta', 'bosta', 'bostana',
  'branquelo', 'brecha', 'brexa', 'brioco', 'bronha', 'buca', 'buceta', 'bugre',
  'bunda', 'bunduda', 'burra', 'burro', 'busseta', 'caceta', 'cacete', 'cachorra',
  'cachorro', 'cadela', 'caga', 'cagado', 'cagao', 'cagona', 'caipira', 'canalha',
  'canceroso', 'caralho', 'casseta', 'cassete', 'ceguinho', 'checheca', 'chereca',
  'chibumba', 'chibumbo', 'chifruda', 'chifrudo', 'chochota', 'chota', 'chupada',
  'chupado', 'ciganos', 'clitoris', 'cocaina', 'coco', 'comunista', 'corna',
  'cornagem', 'cornao', 'cornisse', 'corno', 'cornuda', 'cornudo', 'corrupta',
  'corrupto', 'coxo', 'cretina', 'cretino', 'criolo', 'crioulo', 'cruzcredo',
  'cu', 'culhao', 'curalho', 'cuzao', 'cuzuda', 'cuzudo', 'debil', 'debiloide',
  'deficiente', 'defunto', 'demonio', 'denegrir', 'denigrir', 'detento', 'difunto',
  'doida', 'doido', 'egua', 'elemento', 'encostado', 'esclerosado', 'escrota',
  'escroto', 'esporrada', 'esporrado', 'esporro', 'estupida', 'estupidez',
  'estupido', 'facista', 'fanatico', 'fascista', 'fedida', 'fedido', 'fedor',
  'fedorenta', 'feia', 'feio', 'feiosa', 'feioso', 'feioza', 'feiozo', 'felacao',
  'fenda', 'foda', 'fodao', 'fode', 'fodi', 'fodida', 'fodido', 'fornica',
  'fornicacao', 'fudecao', 'fudendo', 'fudida', 'fudido', 'furada', 'furado',
  'furao', 'furnica', 'furnicar', 'furo', 'furona', 'gai', 'gaiata', 'gaiato',
  'gay', 'gilete', 'goianada', 'gonorrea', 'gonorreia', 'gosmenta', 'gosmento',
  'grelinho', 'grelo', 'gringo', 'homosexual', 'homosexualismo', 'idiota',
  'idiotice', 'imbecil', 'inculto', 'iscrota', 'iscroto', 'japa', 'judiar',
  'ladra', 'ladrao', 'ladroeira', 'ladrona', 'lalau', 'lazarento', 'leprosa',
  'leproso', 'lesbica', 'louco', 'macaca', 'macaco', 'machona', 'macumbeiro',
  'malandro', 'maluco', 'maneta', 'marginal', 'masturba', 'meleca', 'meliante',
  'merda', 'mija', 'mijada', 'mijado', 'mijo', 'minorias', 'mocrea', 'mocreia',
  'moleca', 'moleque', 'mondronga', 'mondrongo', 'mongol', 'mongoloide',
  'mulata', 'mulato', 'naba', 'nadega', 'nazista', 'negro', 'nhaca', 'nojeira',
  'nojenta', 'nojento', 'nojo', 'olhota', 'otaria', 'otario', 'paca', 'palhaco',
  'paspalha', 'paspalhao', 'paspalho', 'pau', 'peao', 'peia', 'peido', 'pemba',
  'penis', 'pentelha', 'pentelho', 'perereca', 'perneta', 'peru', 'pica',
  'picao', 'pilantra', 'pinel', 'pintao', 'pinto', 'pintudo', 'piranha',
  'piroca', 'piru', 'pivete', 'porra', 'prega', 'prequito', 'preso', 'priquito',
  'prostibulo', 'prostituta', 'prostituto', 'punheta', 'punhetao', 'pus',
  'pustula', 'puta', 'puto', 'puxasaco', 'rabao', 'rabo', 'rabuda', 'rabudao',
  'rabudo', 'rabudona', 'racha', 'rachada', 'rachadao', 'rachadinha',
  'rachadinho', 'rachado', 'ramela', 'remela', 'retardada', 'retardado',
  'ridicula', 'roceiro', 'rola', 'rolinha', 'rosca', 'sacana', 'safada',
  'safado', 'sapatao', 'sifilis', 'siririca', 'tarada', 'tarado', 'testuda',
  'tesuda', 'tesudo', 'tezao', 'tezuda', 'tezudo', 'traveco', 'trocha',
  'trolha', 'troucha', 'trouxa', 'troxa', 'tuberculoso', 'tupiniquim', 'turco',
  'vaca', 'vadia', 'vagabunda', 'vagabundo', 'vagal', 'vagina', 'veada',
  'veadao', 'veado', 'viada', 'viadagem', 'viadao', 'viado', 'xana',
  'xaninha', 'xavasca', 'xerereca', 'xexeca', 'xibiu', 'xibumba', 'xiita',
  'xochota', 'xota', 'xoxota'
];

// Lista de frases ofensivas (de frases.txt)
const frasesOfensivas = [
  'a coisa ficou preta', 'a coisa ta preta', 'cabeça chata', 'cabelo duro',
  'cabelo pixaim', 'cabelo ruim', 'criado mudo', 'debil mental', 'de menor',
  'esta russo', 'farinha do mesmo saco', 'feito nas coxas', 'humor negro',
  'inveja branca', 'lista negra', 'maria vai com as outras', 'meia tigela',
  'mercado negro', 'mulher da vida', 'mulher de vida facil', 'nao sou tuas negas',
  'pessoas especiais', 'portador de necessidades especiais', 'preto de alma branca',
  'prostituicao infantil', 'surdo-mudo'
];

// Função para normalizar texto (remover acentos e converter para minúsculas)
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Função para verificar palavras ou frases ofensivas
function contemPalavraOfensiva(texto) {
  const textoNormalizado = normalizarTexto(texto);
  
  // Verificar palavras ofensivas (usando limites de palavra)
  const palavraOfensiva = palavrasOfensivas.some(palavra => {
    const regex = new RegExp(`\\b${normalizarTexto(palavra)}\\b`, 'i');
    return regex.test(textoNormalizado);
  });
  
  // Verificar frases ofensivas (correspondência exata)
  const fraseOfensiva = frasesOfensivas.some(frase => {
    return textoNormalizado.includes(normalizarTexto(frase));
  });
  
  const resultado = palavraOfensiva || fraseOfensiva;
  console.log(`Verificando texto: "${texto}" | Ofensivo: ${resultado} (Palavra: ${palavraOfensiva}, Frase: ${fraseOfensiva})`);
  return resultado;
}

const popover = document.createElement('div');
popover.classList.add('popover-nomes');
usuariosOnline.appendChild(popover);

let isTabActive = document.hasFocus();
const originalTitle = document.title;
let typingRef = null;
let typingTimeout;

function sanitizar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function aceitarConsentimento() {
  localStorage.setItem('consentimento', 'true');
  document.getElementById('consentBanner').style.display = 'none';
}

if (!localStorage.getItem('consentimento')) {
  document.getElementById('consentBanner').style.display = 'block';
}

const emojis = ['😊', '😂', '😍', '😎', '😢', '😜', '😡', '😱', '👍', '👎', '❤️', '🔥'];
emojis.forEach(emoji => {
  const button = document.createElement('button');
  button.textContent = emoji;
  button.classList.add('emoji');
  button.addEventListener('click', () => {
    input.value += emoji;
    input.focus();
    emojiPicker.style.display = 'none';
  });
  emojiPicker.appendChild(button);
});

emojiBtn.addEventListener('click', () => {
  emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
});

window.addEventListener('focus', () => {
  isTabActive = true;
  document.title = originalTitle;
});

window.addEventListener('blur', () => {
  isTabActive = false;
});

toggleSenhaBtn.addEventListener('click', () => {
  const isPasswordVisible = senhaInput.type === 'text';
  senhaInput.type = isPasswordVisible ? 'password' : 'text';
  const icone = document.getElementById('iconeOlho');
  icone.src = isPasswordVisible
    ? 'https://cdn-icons-png.flaticon.com/128/2767/2767146.png' // olho fechado
    : 'https://cdn-icons-png.flaticon.com/512/709/709612.png';   // olho aberto
  icone.alt = isPasswordVisible ? 'Mostrar senha' : 'Ocultar senha';
});

// Função para validar a senha e atualizar a checklist
function validarSenha(senha) {
  const hasLength = senha.length >= 6;
  const hasUppercase = /[A-Z]/.test(senha);
  const hasNumeric = /[0-9]/.test(senha);
  const hasSpecial = /[^a-zA-Z0-9]/.test(senha);

  reqLength.classList.toggle('valido', hasLength);
  reqLength.classList.toggle('invalido', !hasLength);
  reqUppercase.classList.toggle('valido', hasUppercase);
  reqUppercase.classList.toggle('invalido', !hasUppercase);
  reqNumeric.classList.toggle('valido', hasNumeric);
  reqNumeric.classList.toggle('invalido', !hasNumeric);
  reqSpecial.classList.toggle('valido', hasSpecial);
  reqSpecial.classList.toggle('invalido', !hasSpecial);

  return hasLength && hasUppercase && hasNumeric && hasSpecial;
}

// Atualizar checklist em tempo real
senhaInput.addEventListener('input', () => {
  const senha = senhaInput.value.trim();
  passwordChecklist.style.display = senha ? 'block' : 'none';
  validarSenha(senha);
});

auth.onAuthStateChanged(currentUser => {
  console.log('Estado de autenticação alterado:', currentUser);
  if (currentUser) {
    user = currentUser;
    const nome = currentUser.email.split('@')[0] || 'Usuário';
    sessionStorage.setItem('chat_uid', user.uid);
    sessionStorage.setItem('chat_email', user.email);
    sessionStorage.setItem('chat_nome', nome);
    modal.style.display = 'none';
    chatDiv.style.display = 'block';
    usuariosOnlineRef.child(user.uid).set({ nome });
    carregarMensagens();
    console.log('Usuário logado:', user.email, nome);
  } else {
    user = null;
    sessionStorage.removeItem('chat_uid');
    sessionStorage.removeItem('chat_email');
    sessionStorage.removeItem('chat_nome');
    modal.style.display = 'flex';
    chatDiv.style.display = 'none';
    messagesDiv.innerHTML = '';
    console.log('Nenhum usuário logado.');
  }
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Formulário de login enviado:', {
    email: emailInput.value,
    senha: senhaInput.value
  });
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  if (!email || !senha) {
    errorMessage.textContent = 'Por favor, preencha email e senha.';
    errorMessage.style.display = 'block';
    console.log('Campos obrigatórios não preenchidos.');
    return;
  }
  console.log('Tentando login com Firebase...');
  auth.signInWithEmailAndPassword(email, senha)
    .then(userCredential => {
      console.log('Login bem-sucedido:', userCredential.user.email);
      errorMessage.style.display = 'none';
    })
    .catch(error => {
      console.error('Erro no login:', error.code, error.message);
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage.textContent = 'Email ou senha incorretos. Verifique suas credenciais.';
          break;
        case 'auth/invalid-email':
          errorMessage.textContent = 'Email inválido. Por favor, insira um email válido.';
          break;
        case 'auth/network-request-failed':
          errorMessage.textContent = 'Erro de rede. Verifique sua conexão com a internet.';
          break;
        default:
          errorMessage.textContent = `Erro ao logar: ${error.message}`;
      }
      errorMessage.style.display = 'block';
    });
});

registerBtn.addEventListener('click', () => {
  console.log('Botão de registro clicado:', {
    email: emailInput.value,
    senha: senhaInput.value
  });
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  if (!email || !senha) {
    errorMessage.textContent = 'Por favor, preencha email e senha.';
    errorMessage.style.display = 'block';
    console.log('Campos obrigatórios não preenchidos.');
    return;
  }
  if (!validarSenha(senha)) {
    errorMessage.textContent = 'A senha não atende aos requisitos. Verifique a checklist.';
    errorMessage.style.display = 'block';
    console.log('Senha não atende aos requisitos.');
    return;
  }
  console.log('Tentando registro com Firebase...');
  auth.createUserWithEmailAndPassword(email, senha)
    .then(userCredential => {
      console.log('Registro bem-sucedido:', userCredential.user.email);
      errorMessage.style.display = 'none';
    })
    .catch(error => {
      console.error('Erro no registro:', error.code, error.message);
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage.textContent = 'Este email já está em uso. Tente outro email ou faça login.';
          break;
        case 'auth/weak-password':
          errorMessage.textContent = 'Senha fraca. Verifique os requisitos na checklist.';
          break;
        case 'auth/invalid-email':
          errorMessage.textContent = 'Email inválido. Por favor, insira um email válido.';
          break;
        case 'auth/network-request-failed':
          errorMessage.textContent = 'Erro de rede. Verifique sua conexão com a internet.';
          break;
        default:
          errorMessage.textContent = `Erro ao registrar: ${error.message}`;
      }
      errorMessage.style.display = 'block';
    });
});

resetSenhaBtn.addEventListener('click', () => {
  console.log('Botão de redefinição de senha clicado:', emailInput.value);
  const email = emailInput.value.trim();
  if (!email) {
    errorMessage.textContent = 'Por favor, insira um email.';
    errorMessage.style.display = 'block';
    console.log('Campo de email não preenchido.');
    return;
  }
  console.log('Enviando email de redefinição...');
  auth.sendPasswordResetEmail(email)
    .then(() => {
      console.log('Email de redefinição enviado:', email);
      errorMessage.textContent = 'Email de redefinição de senha enviado! Verifique sua caixa de entrada.';
      errorMessage.style.color = 'green';
      errorMessage.style.display = 'block';
    })
    .catch(error => {
      console.error('Erro ao enviar email de redefinição:', error.code, error.message);
      errorMessage.textContent = `Erro ao enviar email de redefinição: ${error.message}`;
      errorMessage.style.color = 'red';
      errorMessage.style.display = 'block';
    });
});

logoutBtn.addEventListener('click', () => {
  if (user) {
    usuariosOnlineRef.child(user.uid).remove();
    auth.signOut();
    console.log('Logout realizado:', user.email);
  }
});

window.addEventListener('beforeunload', () => {
  if (user) usuariosOnlineRef.child(user.uid).remove();
});

salaSelect.addEventListener('change', () => {
  salaAtual = salaSelect.value;
  mensagensRef.off();
  typingRef?.remove();
  messagesDiv.innerHTML = '';
  mensagensRef = db.ref(`mensagens/${salaAtual}`);
  digitandoRef.off();
  digitandoRef = db.ref(`digitando/${salaAtual}`);
  digitandoRef.on('value', snapshot => {
    const digitando = snapshot.val();
    const nomes = digitando
      ? Object.keys(digitando)
          .filter(uid => uid !== user?.uid)
          .map(uid => digitando[uid])
          .filter(nome => nome)
      : [];
    digitandoDiv.textContent = nomes.length ? `${nomes.join(', ')} está digitando...` : '';
  });
  carregarMensagens();
});

function exibirMensagem(snapshot, isUpdate = false) {
  const msg = snapshot.val();
  if (!msg) return;

  const msgKey = snapshot.key;
  const msgDiv = isUpdate ? document.querySelector(`.mensagem[data-key="${msgKey}"]`) : document.createElement('div');
  if (!msgDiv) return;

  msgDiv.classList.add('mensagem');
  msgDiv.setAttribute('data-key', msgKey);
  if (msg.uid === user?.uid) msgDiv.classList.add('meu');

  if (!isUpdate) {
    const avatarImg = document.createElement('img');
    avatarImg.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // Imagem única para todos
    avatarImg.alt = `Avatar de ${msg.nome || 'Usuário'}`;
    avatarImg.classList.add('avatar');

    const conteudo = document.createElement('div');
    conteudo.classList.add('conteudo');
    conteudo.innerHTML = `<strong>${msg.nome || 'Usuário'}</strong> [${msg.hora}]: ${sanitizar(msg.texto)}`;

    msgDiv.appendChild(avatarImg);
    msgDiv.appendChild(conteudo);

    if (msg.uid === user?.uid) {
      const botoesAcao = document.createElement('div');
      botoesAcao.classList.add('botoes-acao');

      const editarBtn = document.createElement('button');
      editarBtn.textContent = 'Editar';
      editarBtn.classList.add('editar-btn');
      editarBtn.addEventListener('click', () => iniciarEdicao(msgDiv, msgKey, msg.texto));

      const apagarBtn = document.createElement('button');
      apagarBtn.textContent = 'Apagar';
      apagarBtn.classList.add('apagar-btn');
      apagarBtn.addEventListener('click', () => apagarMensagem(msgKey));

      botoesAcao.appendChild(editarBtn);
      botoesAcao.appendChild(apagarBtn);
      conteudo.appendChild(botoesAcao);
    }

    messagesDiv.appendChild(msgDiv);
  } else {
    const conteudo = msgDiv.querySelector('.conteudo');
    conteudo.innerHTML = `<strong>${msg.nome || 'Usuário'}</strong> [${msg.hora}]: ${sanitizar(msg.texto)}`;
    if (msg.uid === user?.uid) {
      const botoesAcao = conteudo.querySelector('.botoes-acao') || document.createElement('div');
      botoesAcao.classList.add('botoes-acao');
      botoesAcao.innerHTML = `
        <button class="editar-btn" onclick="iniciarEdicao(this.closest('.mensagem'), '${msgKey}', '${msg.texto.replace(/'/g, "\\'")}')">Editar</button>
        <button class="apagar-btn" onclick="apagarMensagem('${msgKey}')">Apagar</button>
      `;
      conteudo.appendChild(botoesAcao);
    }
  }

  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  if (!isUpdate && msg.uid !== user?.uid) {
    notificacaoAudio.play();
    if (!isTabActive) document.title = '(Nova!) ' + originalTitle;
  }
}

function iniciarEdicao(msgDiv, msgKey, textoAtual) {
  const conteudo = msgDiv.querySelector('.conteudo');
  const textoSanitizado = sanitizar(textoAtual);
  conteudo.innerHTML = `
    <input type="text" class="editar-input" value="${textoSanitizado}" maxlength="500">
  `;
  const inputEdicao = conteudo.querySelector('.editar-input');
  inputEdicao.focus();

  inputEdicao.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const novoTexto = inputEdicao.value.trim();
      if (!novoTexto) return;
      if (contemPalavraOfensiva(novoTexto)) {
        errorMessageChat.textContent = 'Mensagem contém palavras inadequadas. Por favor, revise.';
        errorMessageChat.style.display = 'block';
        console.log('Edição bloqueada: palavras ou frases ofensivas detectadas.');
        setTimeout(() => {
          errorMessageChat.style.display = 'none';
        }, 5000);
        return;
      }
      mensagensRef.child(msgKey).update({
        texto: sanitizar(novoTexto),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }).then(() => {
        console.log('Mensagem editada:', msgKey);
        errorMessageChat.style.display = 'none';
      }).catch(error => {
        console.error('Erro ao editar mensagem:', error);
        errorMessageChat.textContent = 'Erro ao editar mensagem.';
        errorMessageChat.style.display = 'block';
        setTimeout(() => {
          errorMessageChat.style.display = 'none';
        }, 5000);
      });
    }
  });
}

function apagarMensagem(msgKey) {
  if (confirm('Tem certeza que deseja apagar esta mensagem?')) {
    mensagensRef.child(msgKey).remove()
      .then(() => {
        console.log('Mensagem apagada:', msgKey);
      })
      .catch(error => {
        console.error('Erro ao apagar mensagem:', error);
        errorMessageChat.textContent = 'Erro ao apagar mensagem.';
        errorMessageChat.style.display = 'block';
        setTimeout(() => {
          errorMessageChat.style.display = 'none';
        }, 5000);
      });
  }
}

function carregarMensagens() {
  mensagensRef.limitToLast(50).on('child_added', snapshot => exibirMensagem(snapshot));
  mensagensRef.on('child_changed', snapshot => exibirMensagem(snapshot, true));
  mensagensRef.on('child_removed', snapshot => {
    const msgKey = snapshot.key;
    const msgDiv = document.querySelector(`.mensagem[data-key="${msgKey}"]`);
    if (msgDiv) msgDiv.remove();
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const texto = input.value.trim();
  const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (texto.length > 500) {
    errorMessageChat.textContent = 'Mensagem muito longa! Máximo 500 caracteres.';
    errorMessageChat.style.display = 'block';
    console.log('Mensagem bloqueada: muito longa.');
    setTimeout(() => {
      errorMessageChat.style.display = 'none';
    }, 5000);
    return;
  }

  if (contemPalavraOfensiva(texto)) {
    errorMessageChat.textContent = 'Mensagem contém palavras inadequadas. Por favor, revise.';
    errorMessageChat.style.display = 'block';
    console.log('Mensagem bloqueada: palavras ou frases ofensivas detectadas.');
    setTimeout(() => {
      errorMessageChat.style.display = 'none';
    }, 5000);
    return;
  }

  if (texto && user) {
    mensagensRef.push({
      uid: user.uid,
      nome: sessionStorage.getItem('chat_nome'),
      texto: sanitizar(texto),
      hora
    }).then(() => {
      input.value = '';
      errorMessageChat.style.display = 'none';
    }).catch(error => {
      console.error('Erro ao enviar mensagem:', error);
      errorMessageChat.textContent = 'Erro ao enviar mensagem.';
      errorMessageChat.style.display = 'block';
      setTimeout(() => {
        errorMessageChat.style.display = 'none';
      }, 5000);
    });
  }
});

usuariosOnline.addEventListener('click', () => {
  popover.style.display = popover.style.display === 'block' ? 'none' : 'block';
});

usuariosOnlineRef.on('value', snapshot => {
  const online = snapshot.val();
  const nomes = online
    ? Object.keys(online)
        .filter(uid => uid !== user?.uid)
        .map(uid => online[uid].nome)
        .filter(nome => nome)
    : [];
  listaUsuarios.textContent = nomes.length ? nomes.join(', ') : 'só você 😊';
  popover.innerHTML = nomes.length ? nomes.map(nome => `<span>${nome}</span>`).join('') : '<span>só você 😊</span>';
});

function atualizarDigitando() {
  if (!user) return;
  clearTimeout(typingTimeout);
  typingRef?.remove();
  typingRef = db.ref(`digitando/${salaAtual}/${user.uid}`);
  typingRef.set(sessionStorage.getItem('chat_nome'));
  typingTimeout = setTimeout(() => typingRef.remove(), 3000);
}

input.addEventListener('input', atualizarDigitando);

function aplicarTema(tema) {
  if (tema === 'claro') {
    document.documentElement.style.setProperty('--fundo', '#F0F2F5');
    document.documentElement.style.setProperty('--texto', '#050505');
    document.documentElement.style.setProperty('--borda', '#CED0D4');
    document.documentElement.style.setProperty('--hover', '#E4E6EB');
    document.documentElement.style.setProperty('--acento', '#006AFF');
    document.body.style.color = '#050505';
    document.body.setAttribute('data-theme', 'claro');
  } else {
    document.documentElement.style.setProperty('--fundo', '#242526');
    document.documentElement.style.setProperty('--texto', '#E4E6EB');
    document.documentElement.style.setProperty('--borda', '#3E4042');
    document.documentElement.style.setProperty('--hover', '#3A3B3C');
    document.documentElement.style.setProperty('--acento', '#006AFF');
    document.body.style.color = '#E4E6EB';
    document.body.setAttribute('data-theme', 'escuro');
  }
  localStorage.setItem('tema', tema);
}

temaBtn.addEventListener('click', () => {
  const atual = localStorage.getItem('tema') || 'escuro';
  const novo = atual === 'escuro' ? 'claro' : 'escuro';
  aplicarTema(novo);
});

aplicarTema(localStorage.getItem('tema') || 'escuro');