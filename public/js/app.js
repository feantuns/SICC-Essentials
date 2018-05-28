// Initialize Firebase
var config = {
    apiKey: "AIzaSyAjbHWIuFi_tMuPMuRNIS9saqzpoJT_kOQ",
    authDomain: "siccessencialprojeto.firebaseapp.com",
    databaseURL: "https://siccessencialprojeto.firebaseio.com",
    projectId: "siccessencialprojeto",
    storageBucket: "siccessencialprojeto.appspot.com",
    messagingSenderId: "770370128113"
  };
firebase.initializeApp(config);

//variaveis de atalho para acesso ao bd
const database = firebase.database(); //bd
const rootRef = database.ref(); //path raiz do bd

var motivo; //motivo da notificacao

var user; // armazena o usuario logado atualmente
var userId;
var selectedFile; //armazena o arquivo enviado pelo usuario

var esc = document.getElementById('esc');
var escLogin = document.getElementById('esc-login');
var texto = 'Essencial';

$(document).ready(function() {

  escrever(texto, escLogin);

  //Status firebase Login
  firebase.auth().onAuthStateChanged(function(user) {

    if (user) {

      $('body').css('overflow', 'auto');

      $('#wrapper').removeClass('d-flex');
      $('#wrapper').hide();
      $('#container-login').hide();

      //LOADING
      setTimeout(function() {
        $('#loader').hide();
        escrever(texto, esc);
      }, 2000);

      user = firebase.auth().currentUser;
      userId = user.uid;

    } else {

        //mostrando container login
        $('#container-login').show();
        $('#wrapper').show();
        $('#wrapper').addClass('d-flex');
        $('#loader').show();

        $('body').css('overflow', 'hidden');

        if ($('#wrapper').css('display', 'block')) {
          $(document).keypress(function(e) {
            if (e.which == 13) $('#btnLogin').click();
          });
        }

      }

  });
});

'use strict';

//Evento Login
$('#btnLogin').on("click", e => {
  // Email e senha
  const email = $('#txtEmail').val();
  const senha = $('#txtPassword').val();
  const auth = firebase.auth();
  // Login
  const promise = auth.signInWithEmailAndPassword(email, senha);
  promise.catch(e => $("#emailError").show());
});

//Evento Logout
$('#btnLogout').on("click", e => {
  firebase.auth().signOut();
  window.location.reload();
});

//Evento Troca Senha
$('#linkTrocaSenha').on('click', function() {
  $('#btnTrocaTipo').removeClass('d-block');
  $('#btnTrocaTipo').hide();
  $('#container-normal').hide();
  $('#container-troca-senha').show();
  $('#btnLogin').hide();
  $('#linkTrocaSenha').hide();
  $('#btnTrocaSenha').show();
  $('#linkSaiLogin').hide();
  $('#saiTrocaSenha').show();
});

//Voltando ao normal
$('#saiTrocaSenha').on('click', function() {
  $('#saiTrocaSenha').hide();
  $('#btnTrocaTipo').addClass('d-block');
  $('#btnTrocaTipo').show();
  $('#btnTrocaSenha').hide();
  $('#container-normal').show();
  $('#container-troca-senha').hide();
  $('#btnLogin').show();
  $('#linkSaiLogin').show();
  $('#linkTrocaSenha').show();
});

//Função envia email de troca senha
$('#btnTrocaSenha').on('click', function() {

  var auth = firebase.auth();
  var emailAddress = $('#txtEmailSenha').val();

  auth.sendPasswordResetEmail(emailAddress).then(function() {
    $('#emailError').hide();
    $('#emailSenhaEnviado').show();
    $('#form-login').show();
    $('#form-troca-senha').hide();
  }, function(error) {
    $('#emailError').hide();
    $('#emailSenhaEnviado').hide();
    $('#emailSenhaNaoEnviado').show();
    $('#form-login').hide();
  });

  $('#linkSaiLogin').show();
  $('#saiTrocaSenha').hide();
  $('#btnTrocaTipo').addClass('d-block');
  $('#btnTrocaTipo').show();
  $('#btnTrocaSenha').hide();
  $('#container-normal').show();
  $('#container-troca-senha').hide();
  $('#btnLogin').show();
  $('#linkTrocaSenha').show();

});

//mostrar/esconder container nova notificacao
var dialogNotificacao = document.querySelector('#dialog-notificacao');
var showDialogNotificacao = document.querySelector('#btnNotificacao');

showDialogNotificacao.addEventListener('click', function() {
  $('#dialog-notificacao').show()
});
dialogNotificacao.querySelector('.close').addEventListener('click', function() {

  $("#inputError").hide();
  $("#campo-visita").hide();
  $('#btnProximo').show();
  $('#btnEnviar').hide();
  $('#campos-inicio').show();
  $('#campos-proximo').hide();
  $('#quadra').val("");
  $('#lote').val("");
  $('#moradores').empty();

  $('#dialog-notificacao').hide();

});
dialogNotificacao.querySelector('.ativaCampoVisita').addEventListener('click', function() {
  $("#campo-visita").show();
});

function chamaListaNomes(usuarios) {
  var options = [];

  for (var i = 0; i < usuarios.length; i++) {

    var nomesRef = rootRef.child('Usuarios/' + usuarios[i]).on('value', function(snapshot) {
      var dados = snapshot.val();

      var option = document.createElement('option');
      option.classList.add('nome-completo');

      option.value = dados.nome_completo;
      option.innerText = dados.nome_completo;

      options.push(option);

    });
    for (var j = 0; j < options.length; j++) {
      document.getElementById('moradores').appendChild(options[i]);
    }
  }
}

//valida e mostra mais informacoes
$('#btnProximo').on('click', function() {
  var usuarioDestino = new Array();
  var quadra = $('#quadra').val();
  var lote = $('#lote').val();
  var temBloco = false;

  var quadraRef = rootRef.child('Usuarios').orderByChild('quadra').equalTo(quadra).on('value', function(snapshot) {

    snapshot.forEach(function(childSnapshot) {
      var usuarioDestinoId = childSnapshot.key;
      var loteAtual = childSnapshot.val().lote;
      if (loteAtual == lote) {
        usuarioDestino.push(usuarioDestinoId);
      }

      temBloco = true;

    });

    if (temBloco == false) {
      var notification = document.querySelector('#toast-informacao');
      var data = {
        message: 'Quadra ou Lote Inválidos',
        actionText: 'Undo',
        timeout: 5000
      };
      notification.MaterialSnackbar.showSnackbar(data);
    } else {
      $('#btnProximo').hide();
      $('#btnEnviar').show();
      $('#campos-inicio').hide();
      $('#campos-proximo').show();
      chamaListaNomes(usuarioDestino);
    }

  });

});

//Funcao envia notificacao
$('#btnEnviar').on("click", function() {

  tempoAtual();

  var nomeVisita;
  var userId = firebase.auth().currentUser.uid;
  var morador = $('#moradores').val();
  var msgKey = database.ref('Mensagens').push().key;
  var funcionario;
  var data;
  var userKey;

  if (document.getElementById('motivo1').checked) {
    motivo = 'Encomenda';
    nomeVisita = 'null';
  } else if (document.getElementById('motivo2').checked) {
    motivo = 'Carta';
    nomeVisita = 'null';
  } else if (document.getElementById('motivo3').checked) {
    motivo = 'Conta';
    nomeVisita = 'null';
  } else if (document.getElementById('motivo4').checked) {
    motivo = 'Visita';
    $("#campo-visita").show();
    nomeVisita = $('#visita').val();
  }

  var nomeMoradorRef = rootRef.child('Usuarios').orderByChild('nome_completo').equalTo(morador)
  .on('value', function(snap) {

    snap.forEach(function(childSnapshot) {
      userKey = childSnapshot.key;
      var funcionarioRef = rootRef.child('Funcionarios/' + userId)
      .on('value', function(snapshot) {
        funcionario = snapshot.val().nome_completo;

        rootRef.child('Usuarios').orderByChild('nome_completo').equalTo(morador)
        .once('value').then(function(snapshot) {
          if (snapshot.exists()) {
            data = {
              data: fullData,
              tempo: tempo,
              nome: morador,
              motivo: motivo,
              visita: nomeVisita,
              funcionario: funcionario
            };

            //limpando e atualizando banco de dados
            $('#notificacoes-aguardando').empty();
            $('#notificacoes-engano').empty();
            $('#notificacoes-retiradas').empty();
            var updates = {};
            updates['/Mensagens/Todas/' + msgKey] = data;
            updates['/Mensagens/' + userKey + '/' + msgKey] = data;
            firebase.database().ref().update(updates);

            $("#campo-visita").hide();
            $('#btnProximo').show();
            $('#btnEnviar').hide();
            $('#campos-inicio').show();
            $('#campos-proximo').hide();
            $('#quadra').val("");
            $('#lo').val("");
            $('#moradores').empty();

            //fechando e voltando ao normal
            dialogNotificacao.close();

            var notification = document.querySelector('#toast-informacao');
            var data = {
              message: 'Notificação enviada com sucesso',
              actionText: 'Undo',
              timeout: 5000
            };
            notification.MaterialSnackbar.showSnackbar(data);


          } else {
            $("#inputError").show();
            $("#campo-visita").hide();
            document.getElementById("moradores").focus();
          }
        });
      });
    });
  });
});

// funcao responsavel por chamar o historico de mensagens enviadas pelo funcionario papra os moradores
function chamaHistorico() {

  var userId = firebase.auth().currentUser.uid;

  var ususarioRef = rootRef.child('Funcionarios/' + userId).on('value', function(snapshot) {
    var nome = snapshot.val().nomeCompleto;

    var historicoRef = firebase.database().ref('/Mensagens/Todas/').orderByChild('tempo')
    .on('value', function(snap) {
      $('#notificacoes-aguardando').empty();
      $('#notificacoes-engano').empty();
      $('#notificacoes-retiradas').empty();
      snap.forEach(function(childSnapshot) {
        var notificacoes = childSnapshot.val();
        var tempo = notificacoes.tempo;

        if(notificacoes.funcionario == nome) {

          var key = childSnapshot.key;
          var html;
          var num = childSnapshot.numChildren();

          if(num == 7) {

            var statusNotificacao = rootRef.child('/Mensagens/Todas/' + key + '/Status/')
            .on('value', function(snapshot) {
              if(snapshot.val().status == 'Retirada') {
                //criando o card
                html =
                '<div class="flip-container card-historico" style="margin-top: 3rem; color: white; background-color: #5cb85c">' +
                  '<div class="card-block">' +
                    '<div class="card-text destinatario"></div>' +
                    '<hr class="my-4 linha-historico">' +
                    '<div class="card-text motivo"></div>' +
                    '<hr class="my-4 linha-historico">' +
                    '<div class="card-text data"></div>' +
                    '<hr class="my-4 linha-historico">' +
                    '<div class="card-text"> Status: Retirada</div>' +
                  '</div>' +
                '</div>';

                //criando div que vai suportar o card
                var div = document.createElement('div');
                div.innerHTML = html;
                div.classList.add('elemento');

                //passando os valores de cada notificacao
                div.getElementsByClassName('destinatario')[0].innerText = 'Enviada para ' + notificacoes.nome;
                div.getElementsByClassName('motivo')[0].innerText = 'Motivo do envio: ' + notificacoes.motivo;
                div.getElementsByClassName('data')[0].innerText = 'Enviada em ' + notificacoes.data;

                document.getElementById("notificacoes-retiradas").appendChild(div);
              } else {
                //criando o card
                html =
                '<div class="flip-container card-historico" style="margin-top: 3rem; color: white; background-color: #d9534f;">' +
                  '<div class="card-block">' +
                    '<div class="card-text destinatario"></div>' +
                    '<hr class="my-4 linha-historico">' +
                    '<div class="card-text motivo"></div>' +
                    '<hr class="my-4 linha-historico">' +
                    '<div class="card-text data"></div>' +
                    '<hr class="my-4 linha-historico">' +
                    '<div class="card-text"> Status: Engano</div>' +
                  '</div>' +
                '</div>';

                //criando div que vai suportar o card
                var div = document.createElement('div');
                div.innerHTML = html;
                div.classList.add('elemento');

                //passando os valores de cada notificacao
                div.getElementsByClassName('destinatario')[0].innerText = 'Enviada para ' + notificacoes.nome;
                div.getElementsByClassName('motivo')[0].innerText = 'Motivo do envio: ' + notificacoes.motivo;
                div.getElementsByClassName('data')[0].innerText = 'Enviada em ' + notificacoes.data;

                document.getElementById("notificacoes-engano").appendChild(div);
              }
            });
          } else {

            //criando modal
            var modalRetirada =
            '<div class="modal fade" id="' + tempo + 'c" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">' +
              '<div class="modal-dialog" role="document">' +
                '<div class="modal-content">' +
                  '<div class="modal-header" style="padding-top: 0;">' +
                    '<h5 class="modal-title" id="exampleModalLabel">Encomenda Retirada</h5>' +
                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                      '<span aria-hidden="true">&times;</span>' +
                    '</button>' +
                  '</div>' +
                  '<div class="modal-body" style="color: #757575">' +
                    '<h6>Tem certeza que essa encomenda foi retirada na portaria?</h6>' +
                  '</div>' +
                  '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-secondary" data-dismiss="modal">Não, Fechar</button>' +
                    '<button type="button" class="btn btn-warning btn-confirmar-status" onclick="encomendaRetirada(' + tempo + ')">Sim</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';

            //Integrando modal à pagina
            var modalDiv = document.createElement('div');
            modalDiv.innerHTML = modalRetirada;
            document.querySelector('body').appendChild(modalDiv);

            //criando modal Engano
            var modalEngano =
            '<div class="modal fade" id="' + tempo + 'e" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">' +
              '<div class="modal-dialog" role="document">' +
                '<div class="modal-content">' +
                  '<div class="modal-header" style="padding-top: 0;">' +
                    '<h5 class="modal-title" id="exampleModalLabel">Engano</h5>' +
                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                      '<span aria-hidden="true">&times;</span>' +
                    '</button>' +
                  '</div>' +
                  '<div class="modal-body" style="color: #757575">' +
                  '<h6 style="margin-bottom: 0;">Tem certeza que essa notificação foi enviada erroneamente?</h6> <br>' +
                    '<h6 style="margin-top: 0;">Uma nova notificação informando o morador sobre a ocorrência será enviada caso você confirme a situação!</h6>' +
                  '</div>' +
                  '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-secondary" data-dismiss="modal">Não, Fechar</button>' +
                    '<button type="button" class="btn btn-warning btn-confirmar-status" onclick="engano(' + tempo + ')">Confirmar</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';

            //Integrando modalEngano à pagina
            var modalDiv = document.createElement('div');
            modalDiv.innerHTML = modalEngano;
            document.querySelector('body').appendChild(modalDiv);

            //criando o card
            html =
            '<div class="flip-container card-historico" style="margin-top: 3rem; color: #757575;" ontouchstart="this.classList.toggle(' + "hover" + ');">' +
              '<div class="flipper">' +
                '<div class="front">' +
                  '<div class="card-block">' +
                    '<div class="card-text destinatario"></div>' +
                    '<hr class="my-4 linha-historico">' +
                    '<div class="card-text motivo"></div>' +
                    '<hr class="my-4 linha-historico">' +
                    '<div class="card-text data"></div>' +
                    '<hr class="my-4 linha-historico">' +
                    '<div class="card-text"> Status: Aguardando</div>' +
                  '</div>' +
                '</div>' +
                '<div class="back">' +
                  '<div class="card-block">' +
                    '<div class="container">' +
                      '<div class="row" style="display: flex; justify-content: center; margin-top: 2.5rem;">' +
                        '<button class="btn btn-success btn-status-notificacao btn-confirmar" data-toggle="modal" title="Encomenda Retirada" data-target="#' + tempo + 'c" >' +
                          '<i class="fa fa-check fa-2x" aria-hidden="true"></i>' +
                        '</button>' +
                        '<button class="btn btn-danger btn-status-notificacao btn-engano" data-toggle="modal" title="Engano" data-target="#' + tempo + 'e">' +
                          '<i class="fa fa-times fa-2x" aria-hidden="true"></i>' +
                        '</button>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';

            //criando div que vai suportar o card
            var div = document.createElement('div');
            div.innerHTML = html;
            div.classList.add('elemento');

            //passando os valores de cada notificacao
            div.getElementsByClassName('destinatario')[0].innerText = 'Enviada para ' + notificacoes.nome;
            div.getElementsByClassName('motivo')[0].innerText = 'Motivo do envio: ' + notificacoes.motivo;
            div.getElementsByClassName('data')[0].innerText = 'Enviada em ' + notificacoes.data;

            document.getElementById("notificacoes-aguardando").appendChild(div);
          }
        }
      });
    });
  });

}

$('#mostra-aguardando').on('click', function() {
  $('#notificacoes-aguardando').show();
  $('#notificacoes-engano').hide();
  $('#notificacoes-retiradas').hide();
});

$('#mostra-retiradas').on('click', function() {
  $('#notificacoes-retiradas').show();
  $('#notificacoes-engano').hide();
  $('#notificacoes-aguardando').hide();
});

$('#mostra-enganos').on('click', function() {
  $('#notificacoes-engano').show();
  $('#notificacoes-aguardando').hide();
  $('#notificacoes-retiradas').hide();
});

//funcao marca encomenda como retirada
function encomendaRetirada(tempo) {
  var alteraStatusRetirada = rootRef.child('Mensagens/Todas/').orderByChild('tempo').equalTo(tempo)
  .on('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var nome = childSnapshot.val().nome;
      var key = childSnapshot.key;
      var status = {
        status: 'Retirada'
      }
      var updates = {};
      var userDestino = rootRef.child('Usuarios').orderByChild('nomeCompleto').equalTo(nome)
      .on('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var userKey = childSnapshot.key;
          updates['Mensagens/' + userKey + '/' + key + '/Status'] = status;
          updates['Mensagens/Todas/' + key + '/Status'] = status;
          firebase.database().ref().update(updates);
        });
      })
    })
  })

  var notification = document.querySelector('#toast-informacao');
  var data = {
    message: 'Notificação alterada como "Retirada"!',
    actionText: 'Undo',
    timeout: 5000
  };
  notification.MaterialSnackbar.showSnackbar(data);

  $('#' + tempo + 'c').modal('hide');
}

//funcao altera notificacao com o status Engano
function engano(tempo) {
  var alteraStatusRetirada = rootRef.child('Mensagens/Todas/').orderByChild('tempo').equalTo(tempo)
  .on('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var nome = childSnapshot.val().nome;
      var key = childSnapshot.key;
      var status = {
        status: 'Engano'
      }
      var updates = {};
      var userDestino = rootRef.child('Usuarios').orderByChild('nomeCompleto').equalTo(nome)
      .on('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var userKey = childSnapshot.key;
          updates['Mensagens/' + userKey + '/' + key + '/Status'] = status;
          updates['Mensagens/Todas/' + key + '/Status'] = status;
          firebase.database().ref().update(updates);
        });
      });

      var notification = document.querySelector('#toast-informacao');
      var data = {
        message: 'Uma Notificação de Engano foi enviada para o morador ' + nome + '!',
        actionText: 'Undo',
        timeout: 5000
      };
      notification.MaterialSnackbar.showSnackbar(data);

    })
  })
  $('#' + tempo + 'e').modal('hide');
}

//abre dialog para alterar imagem de perfil
var dialogAlteraImagemPerfil = document.querySelector('#dialog-troca-imagem'); //dialog
var showDialogTrocaImagemPerfil = document.querySelector('#troca-imagem'); //button

showDialogTrocaImagemPerfil.addEventListener('click', function() {
  $('#dialog-troca-imagem').show()
  // fixaTela.classList.add('fixed');
  $('html').css('overflow', 'hidden');
});
dialogAlteraImagemPerfil.querySelector('.close').addEventListener('click', function() {
  $('#dialog-troca-imagem').hide()
  $('#senha-invalida').hide();
});

//aguarda a alteração do input que permite a seleção de uma nova foto e
//então armazena o arquivo selecionado em uma variavel
$('#imagem-perfil').on('change', function(event) {
  selectedFile = event.target.files[0];
  $('#novaImagemPerfil').empty();

  var loadingImage = loadImage(
    selectedFile,
    function(img) {
      $('#novaImagemPerfil').show();
      $('#arquivoInvalidoPerfil').hide();
      try {
        $(img).addClass('rounded-circle');
        $(img).addClass('d-block');
        $(img).addClass('mx-auto');
        $(img).css('width', '150px');
        $(img).css('height', '150px');
        document.getElementById('novaImagemPerfil').appendChild(img);
      } catch (err) {
        $('#arquivoInvalidoPerfil').show();
        selectedFile = '';
      }
    }, {
      maxWidth: 500,
      maxHeight: 500,
      canvas: true,
      pixelRatio: window.devicePixelRatio,
      downsamplingRatio: 0.5,
      orientation: true,
      maxMetaDataSize: 262144,
      disableImageHead: false
    }
  );
  if (!loadingImage) {
    $('#arquivoInvalidoPerfil').show();
    selectedFile = '';
  }

});


//funcao que altera a imagem de perfil do usuario
//ao alterar a foto, a imagem antiga é automaticamente deletada do banco de dados
$('#btnAlterarImagemPerfil').on('click', function() {

  if (selectedFile == "") {
    $('#sem-imagem').show();
  } else {
    //criando referencia no storage
    storageRef = firebase.storage().ref('/perfil-photos/' + selectedFile.name);
    uploadTask = storageRef.put(selectedFile);

    uploadTask.on('state_changed',

      function progress(snapshot) {
        // var percentage = (snapshot.bytesTransferred /
        // snapshot.totalBytes) * 1000;
        // $('#uploader').css({
        //   width: percentage
        // });
      },
      function(error) {

      },
      function() {
        var userId = firebase.auth().currentUser.uid;
        var imagens = rootRef.child('/Funcionarios/' + userId + '/Perfil/').remove();
        var downloadURL = uploadTask.snapshot.downloadURL;
        var imgData = {
          imagemPerfil: downloadURL
        };
        $('#container-noticias').empty();
        var updates = {};
        updates['/Funcionarios/' + userId + '/Perfil/'] = imgData;
        firebase.database().ref().update(updates);
      });

    dialogAlteraImagemPerfil.close();

  }

});

//abre dialog para alterar senha
var dialogNovaSenha = document.querySelector('#dialog-altera-senha'); //dialog
var showDialogNovaSenha = document.querySelector('#show-dialog-senha'); //button

showDialogNovaSenha.addEventListener('click', function() {
  $('#dialog-altera-senha').show()
  $('html').css('overflow', 'hidden');
  var status = document.getElementById('status-redefinicao-senha');
  status.innerText = 'Clique em enviar para que seja enviado à você um email de redefinição de senha!';
});
dialogNovaSenha.querySelector('.close').addEventListener('click', function() {  
  $('#dialog-altera-senha').hide()
  $('#senha-invalida').hide();
});

//funcao altera senha
$('#btnEnviarEmail').on('click', function() {
  var user = firebase.auth().currentUser;
  var auth = firebase.auth();
  var emailAddress = user.email;
  var status = document.getElementById('status-redefinicao-senha');

  auth.sendPasswordResetEmail(emailAddress).then(function() {
    var notification = document.querySelector('#toast-informacao');
    var data = {
      message: 'Um email de redefinição de senha foi enviado para o seu email. Fique de Olho!',
      actionText: 'Undo',
      timeout: 5000
    };
    notification.MaterialSnackbar.showSnackbar(data);
    dialogNovaSenha.close();


  }, function(error) {
    status.innerText = 'Algo deu errado!';
  });
});

//funcao pega tempo atualmente
function tempoAtual() {
  //variavel que armazena a data local
  data = new Date();
  dia = data.getDate();
  mesErrado = data.getMonth();
  mesCerto = mesErrado + 1;
  ano = data.getFullYear();
  hora = data.getHours();
  minuto = data.getMinutes();
  fullData = dia + '/' + mesCerto + '/' + ano + ' às ' + hora + 'h' + minuto;
  tempoInicial = data.getTime(); //salvando o tempo atual e milisegundos desde 1 de janeiro de 1970
  tempo = tempoInicial - (tempoInicial * 2);
}

//funcao efeito escrever palavra pausadamente
function escrever(str, el) {
  var char = str.split('').reverse();
  var typer = setInterval(function() {
    if (!char.length) return clearInterval(typer);
    var next = char.pop();
    el.innerHTML += next;
  }, 130);
}
