const firebaseConfig = {
  apiKey: "AIzaSyBc1H4dDL56w70sjCGYDZ5GApv-b845C9w", // Substitua pela chave correta do Firebase Console
  authDomain: "chat-publico-742f8.firebaseapp.com",
  databaseURL: "https://chat-publico-742f8-default-rtdb.firebaseio.com",
  projectId: "chat-publico-742f8",
  storageBucket: "chat-publico-742f8.firebasestorage.app",
  messagingSenderId: "1002645903917",
  appId: "1:1002645903917:web:25ada52b6801d0242a36a4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

const form = document.getElementById('form');
const input = document.getElementById('input');
const modal = document.getElementById('modal-nome');
const emailInput = document.getElementById('emailInput');
const senhaInput = document.getElementById('senhaInput');
const toggleSenhaBtn = document.getElementById('toggleSenhaBtn');
const nomeInput = document.getElementById('nomeInput');
const avatarInput = document.getElementById('avatarInput');
const updateAvatarBtn = document.getElementById('updateAvatarBtn');
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

let user = null;
let salaAtual = salaSelect.value;
let mensagensRef = db.ref(`mensagens/${salaAtual}`);
const usuariosOnlineRef = db.ref("usuariosOnline");

// Criar o popover para os usuários online
const popover = document.createElement('div');
popover.classList.add('popover-nomes');
usuariosOnline.appendChild(popover);

let isTabActive = document.hasFocus();
const originalTitle = document.title;

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
  const isPasswordVisible = senhaInput.type === 'password';
  senhaInput.type = isPasswordVisible ? 'text' : 'password';
  toggleSenhaBtn.textContent = isPasswordVisible ? '🙈' : '👁️';
});

auth.onAuthStateChanged(currentUser => {
  if (currentUser) {
      user = currentUser;
      const nome = nomeInput.value.trim();
      sessionStorage.setItem('chat_uid', user.uid);
      sessionStorage.setItem('chat_email', user.email);
      sessionStorage.setItem('chat_nome', nome);
      // Carregar o avatar salvo, se existir
      const savedAvatar = sessionStorage.getItem('chat_avatar') || '';
      avatarInput.value = savedAvatar;
      modal.style.display = 'none';
      chatDiv.style.display = 'block';
      usuariosOnlineRef.child(user.uid).set({
          nome: nome
      });
      carregarMensagens();
  } else {
      user = null;
      sessionStorage.removeItem('chat_uid');
      sessionStorage.removeItem('chat_email');
      sessionStorage.removeItem('chat_nome');
      sessionStorage.removeItem('chat_avatar');
      modal.style.display = 'flex';
      chatDiv.style.display = 'none';
      messagesDiv.innerHTML = '';
  }
});

loginBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  const nome = nomeInput.value.trim();
  if (email && senha && nome) {
      auth.signInWithEmailAndPassword(email, senha)
          .then(() => {
              alert('Login bem-sucedido!');
          })
          .catch(error => {
              if (error.code === 'auth/invalid-login-credentials') {
                  alert('Email ou senha incorretos. Verifique suas credenciais ou clique em "Esqueci minha senha".');
              } else {
                  alert('Erro ao logar: ' + error.message);
              }
          });
  } else {
      alert('Por favor, preencha email, senha e nome.');
  }
});

registerBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  const nome = nomeInput.value.trim();
  if (email && senha && nome) {
      auth.createUserWithEmailAndPassword(email, senha)
          .then(() => {
              alert('Registro bem-sucedido! Você está logado.');
          })
          .catch(error => {
              if (error.code === 'auth/email-already-in-use') {
                  alert('Este email já está em uso. Tente outro email ou faça login.');
              } else {
                  alert('Erro ao registrar: ' + error.message);
              }
          });
  } else {
      alert('Por favor, preencha email, senha e nome.');
  }
});

resetSenhaBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  if (email) {
      auth.sendPasswordResetEmail(email)
          .then(() => {
              alert('Email de redefinição de senha enviado! Verifique sua caixa de entrada.');
          })
          .catch(error => {
              alert('Erro ao enviar email de redefinição: ' + error.message);
          });
  } else {
      alert('Por favor, insira um email.');
  }
});

logoutBtn.addEventListener('click', () => {
  if (user) {
      usuariosOnlineRef.child(user.uid).remove();
      auth.signOut();
  }
});

window.addEventListener('beforeunload', () => {
  if (user) {
      usuariosOnlineRef.child(user.uid).remove();
  }
});

updateAvatarBtn.addEventListener('click', () => {
  const avatarLink = avatarInput.value.trim();
  sessionStorage.setItem('chat_avatar', avatarLink);
  alert('Foto atualizada com sucesso!');
  messagesDiv.innerHTML = '';
  carregarMensagens();
});

salaSelect.addEventListener('change', () => {
  salaAtual = salaSelect.value;
  mensagensRef.off();
  messagesDiv.innerHTML = '';
  mensagensRef = db.ref(`mensagens/${salaAtual}`);
  carregarMensagens();
});

function exibirMensagem(snapshot) {
  const msg = snapshot.val();
  if (msg.uid === user.uid || !msg.uid) {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('mensagem');
      if (msg.uid === user.uid) msgDiv.classList.add('meu');

      const avatarImg = document.createElement('img');
      avatarImg.src = msg.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#333"/><path d="M16 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM16 20c-4 0-8 2-8 4h16c0-2-4-4-8-4z" fill="#05fa05"/></svg>';
      avatarImg.alt = `Avatar de ${msg.nome || 'Usuário'}`;
      avatarImg.classList.add('avatar');

      const conteudo = document.createElement('div');
      conteudo.classList.add('conteudo');
      conteudo.innerHTML = `<strong>${msg.nome || 'Usuário'}</strong> [${msg.hora}]: ${sanitizar(msg.texto)}`;

      msgDiv.appendChild(avatarImg);
      msgDiv.appendChild(conteudo);
      messagesDiv.appendChild(msgDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      if (msg.uid !== user.uid) {
          notificacaoAudio.play();
          if (!isTabActive) {
              document.title = '(Nova!) ' + originalTitle;
          }
      }
  }
}

function carregarMensagens() {
  mensagensRef.limitToLast(50).on('child_added', exibirMensagem);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const texto = input.value.trim();
  const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (texto.length > 500) {
      alert("Mensagem muito longa! Máximo 500 caracteres.");
      return;
  }

  if (texto && user) {
      mensagensRef.push({
          uid: user.uid,
          nome: sessionStorage.getItem('chat_nome'),
          texto: sanitizar(texto),
          hora,
          avatar: sessionStorage.getItem('chat_avatar') || ''
      });
      input.value = '';
  }
});

usuariosOnline.addEventListener('click', () => {
  popover.style.display = popover.style.display === 'block' ? 'none' : 'block';
});

usuariosOnlineRef.on('value', snapshot => {
  const online = snapshot.val();
  if (online) {
      const uids = Object.keys(online).filter(uid => uid !== user?.uid);
      const nomes = uids.map(uid => online[uid].nome).filter(nome => nome);
      listaUsuarios.textContent = nomes.length ? nomes.join(', ') : 'só você 😊';
      popover.innerHTML = nomes.length ? nomes.map(nome => `<span>${nome}</span>`).join('') : '<span>só você 😊</span>';
  } else {
      listaUsuarios.textContent = 'só você 😊';
      popover.innerHTML = '<span>só você 😊</span>';
  }
});