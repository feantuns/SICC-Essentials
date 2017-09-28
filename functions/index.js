const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//funcao notificacoes porteiro -> morador
exports.novaEncomenda = functions.database.ref('/Mensagens/Todas/{pushId}').onWrite(event => {

  const snapshot = event.data;

  const nome = snapshot.val().nome;
  const motivo = snapshot.val().motivo;
  const visita = snapshot.val().visita;
  const key = snapshot.key;
  const num = snapshot.numChildren();
  var payload;

  if(num == 7) {
    let statusEnvio = admin.database().ref('/Mensagens/Todas/' + key + '/Status')
    .on('value', function(snapshot) {
      if(snapshot.val().status == 'Engano') {

        var tokensEngano = [];
        var token;
        var engano = {

          data: {
            title: 'Houve um engano, desculpe',
            body: 'Desconsidere a ultima notificação que recebeu, era para outra pessoa',
            icon: 'ic_notification',
            sound: 'default'
          }

        };

        let usuariosEngano = admin.database().ref('Usuarios/').orderByChild('nomeCompleto').equalTo(nome)
        .on('child_added', function(snap) {
    	    //var len = snap.length;
    			var key = snap.key;
          let tokensRef = admin.database().ref('Usuarios/' + key + '/token/')
          .on('child_added', function(snapshot) {
              token = snapshot.val();
              tokensEngano.push(token);
          });

          return admin.messaging().sendToDevice(tokensEngano, engano).then(response => {

            response.results.forEach((result, index) => {
                const error = result.error;
                if (error) {
                    console.error('Algo deu errado', error);
                }
                else{
                    console.log("Notificação enviada com sucesso!");
                }
            });

          });
        });
      }
    });
  } else if(num == 6) {

    if(motivo == 'Encomenda') {
      payload = {

        data: {
          title: 'Encomenda na portaria',
          body: 'Um novo pacote espera por você na portaria',
          icon: 'ic_notification',
          sound: 'default'
        }

      };
    }else if(motivo == 'Carta') {
      payload = {

        data: {
          title: 'Cartas na portaria',
          body: 'Chegaram cartas para você na portaria, venha buscar',
          icon: 'ic_notification',
          sound: 'default'
        }

      };
    }else if(motivo == 'Conta') {
      payload = {

        data: {
          title: 'Contas na portaria',
          body: 'Chegaram contas suas na portaria, venha buscar',
          icon: 'ic_notification',
          sound: 'default'
        }

      };
    }else if(motivo == 'Visita') {
      payload = {

        data: {
          title: visita + ' está aqui',
          body: 'Posso deixá-lo entrar?',
          icon: 'ic_notification',
          sound: 'default'
        }
      };
    }

    var tokensAguardando = [];
    var token;

    let usuariosAguardando = admin.database().ref('Usuarios/').orderByChild('nomeCompleto').equalTo(nome)
    .on('child_added', function(snap) {
      //var len = snap.length;
      var key = snap.key;
      let tokensRef = admin.database().ref('Usuarios/' + key + '/token/')
      .on('child_added', function(snapshot) {
          token = snapshot.val();
          tokensAguardando.push(token);
      });

      return admin.messaging().sendToDevice(tokensAguardando, payload).then(response => {

        response.results.forEach((result, index) => {
            const error = result.error;
            if (error) {
                console.error('Algo deu errado', error);
            }
            else{
                console.log("Notificação enviada com sucesso!");
            }
        });

      });
    });

  }
});
