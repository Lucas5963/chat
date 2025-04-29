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
const form = document.getElementById('form');
const input = document.getElementById('input');
const modal = document.getElementById('modal-nome');
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

let user = null;
let salaAtual = salaSelect.value;
let mensagensRef = db.ref(`mensagens/${salaAtual}`);
let digitandoRef = db.ref(`digitando/${salaAtual}`);
const usuariosOnlineRef = db.ref("usuariosOnline");

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

auth.onAuthStateChanged(currentUser => {
  console.log('Estado de autenticação alterado:', currentUser);
  if (currentUser) {
      user = currentUser;
      const emailPrefix = user.email.split('@')[0];
      const nome = `👤 ${emailPrefix}`;
      sessionStorage.setItem('chat_uid', user.uid);
      sessionStorage.setItem('chat_email', user.email);
      sessionStorage.setItem('chat_nome', nome);
      modal.style.display = 'none';
      chatDiv.style.display = 'block';
      usuariosOnlineRef.child(user.uid).set({ nome: nome });
      carregarMensagens();
      console.log('Usuário logado:', user.email, nome);
  } else {
      user = null;
      sessionStorage.clear();
      modal.style.display = 'flex';
      chatDiv.style.display = 'none';
      messagesDiv.innerHTML = '';
      console.log('Nenhum usuário logado.');
  }
});

loginBtn.addEventListener('click', async () => {
  console.log('Botão de login clicado:', {
    email: emailInput.value,
    senha: senhaInput.value
  });
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  if (!email || !senha) {
      alert('Por favor, preencha email e senha.');
      console.log('Campos obrigatórios não preenchidos.');
      return;
  }
  try {
      console.log('Tentando login com Firebase...');
      const userCredential = await auth.signInWithEmailAndPassword(email, senha);
      console.log('Login bem-sucedido:', userCredential.user.email);
      alert('Login bem-sucedido!');
  } catch (error) {
      console.error('Erro no login:', error.code, error.message);
      switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
              alert('Email ou senha incorretos. Verifique suas credenciais ou clique em "Esqueci minha senha".');
              break;
          case 'auth/invalid-email':
              alert('Email inválido. Por favor, insira um email válido.');
              break;
          case 'auth/network-request-failed':
              alert('Erro de rede. Verifique sua conexão com a internet e tente novamente.');
              break;
          default:
              alert(`Erro ao logar: ${error.message}`);
      }
  }
});

registerBtn.addEventListener('click', async () => {
  console.log('Botão de registro clicado:', {
    email: emailInput.value,
    senha: senhaInput.value
  });
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  if (!email || !senha) {
      alert('Por favor, preencha email e senha.');
      console.log('Campos obrigatórios não preenchidos.');
      return;
  }
  try {
      console.log('Tentando registro com Firebase...');
      const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
      console.log('Registro bem-sucedido:', userCredential.user.email);
      alert('Registro bem-sucedido! Você está logado.');
  } catch (error) {
      console.error('Erro no registro:', error.code, error.message);
      switch (error.code) {
          case 'auth/email-already-in-use':
              alert('Este email já está em uso. Tente outro email ou faça login.');
              break;
          case 'auth/weak-password':
              alert('Senha fraca. A senha deve ter pelo menos 6 caracteres.');
              break;
          case 'auth/invalid-email':
              alert('Email inválido. Por favor, insira um email válido.');
              break;
          case 'auth/network-request-failed':
              alert('Erro de rede. Verifique sua conexão com a internet e tente novamente.');
              break;
          default:
              alert(`Erro ao registrar: ${error.message}`);
      }
  }
});

resetSenhaBtn.addEventListener('click', async () => {
  console.log('Botão de redefinição de senha clicado:', emailInput.value);
  const email = emailInput.value.trim();
  if (!email) {
      alert('Por favor, insira um email.');
      console.log('Campo de email não preenchido.');
      return;
  }
  try {
      console.log('Enviando email de redefinição...');
      await auth.sendPasswordResetEmail(email);
      console.log('Email de redefinição enviado:', email);
      alert('Email de redefinição de senha enviado! Verifique sua caixa de entrada.');
  } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error.code, error.message);
      alert(`Erro ao enviar email de redefinição: ${error.message}`);
  }
});

logoutBtn.addEventListener('click', async () => {
  if (user) {
      await usuariosOnlineRef.child(user.uid).remove();
      await auth.signOut();
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
    avatarImg.src = 'https://cdn-icons-png.flaticon.com/512/6073/6073873.png'; // Substitua por URL real da nova imagem
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
      if (novoTexto) {
        mensagensRef.child(msgKey).update({
          texto: sanitizar(novoTexto),
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }).then(() => {
          console.log('Mensagem editada:', msgKey);
        }).catch(error => {
          console.error('Erro ao editar mensagem:', error);
          alert('Erro ao editar mensagem.');
        });
      }
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
        alert('Erro ao apagar mensagem.');
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
      alert('Mensagem muito longa! Máximo 500 caracteres.');
      return;
  }

  if (texto && user) {
      mensagensRef.push({
          uid: user.uid,
          nome: sessionStorage.getItem('chat_nome'),
          texto: sanitizar(texto),
          hora
      });
      input.value = '';
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
let mediaRecorder;
let audioChunks = [];

const audioBtn = document.getElementById('audioBtn');

audioBtn.addEventListener('click', async () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // 💡 Para produção: envie para o Firebase Storage e salve o link no Realtime Database
      mensagensRef.push({
        uid: user.uid,
        nome: sessionStorage.getItem('chat_nome'),
        texto: '',
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        audioUrl
      });
    };

    mediaRecorder.start();
    audioBtn.textContent = '🔴 Gravando...';
    setTimeout(() => {
      mediaRecorder.stop();
      audioBtn.textContent = '🎤';
    }, 5000000); // grava até 5 segundos
  }
});
if (msg.audioUrl) {
  const audioElement = document.createElement('audio');
  audioElement.src = msg.audioUrl;
  audioElement.controls = true;
  conteudo.appendChild(audioElement);
}
