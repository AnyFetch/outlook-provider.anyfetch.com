var code = "AAABAAAAvPM1KaPlrEqdFSBzjqfTGO9puCYhkwTzk7w30Q_3z2DW7YmlJ4DgmBQAqGoYfcd-GiJ7G676yY2OqM2-OSKkVpmMGehR_y-rHiTeATy1-LU1iElv48kjZQG_yCQeJ2qDnUwH-vGD3faK5fEzXtkXzwNf-vVUoTupNfvK0nXpfRWZGyXHE9POygD3THfh5cpyt73g8jGxia2RSLiWJTy-ndd-r-ALqn7mBq8Lp5O5dZmFh-oyQNA1cTxj9cFINwrzxpAI_NMWr-4_mFOLbVIXsKjfqJOVlxnZue375QB2w-DrI980cup8JLh30s5YzsvTqKdoaXVIg8vSIgZd89JXY56ZCHfQ0xu_wYWuoIUQBiHQdywxc2ZYcOdh8CDZcE8mTOGv2h215z16NtN3NbqgxqY47IRWbfaZ1fqcbXdBWtJot1e7dvgLG_N4hFbztUUFpQJ9Oghv3cdy-prmn9q8Tm6RSZkk8toAVarQchyf1aKpuRRfBLhGiHmnmYDy0fWky86eqQowv3oP1sZYtB9DGn9cGzAceL7eeAVE6W3e5z9zBAO-0u_7rUp_aGwHxmzzud-txCuPGT9NaZbnE3kUm8OyL0uTLw6MVaj3LDglQCwgAA";
var config = require('./config/configuration.js');
var request = require('supertest');

var callbackUrl = config.providerUrl + '/init/callback';
var querystring = require('querystring');

// https://outlook.office365.com/api/v1.0/me/messages?$filter=DateTimeReceived ge 2014-09-01T21:00:00Z&$select=ConversationId
// https://outlook.office365.com/api/v1.0/me/messages?$filter=DateTimeReceived ge 1970-01-01T00:00:01.970Z&$select=ConversationId&$top=100&$skip=0

// https://outlook.office365.com/api/v1.0/me/messages?$filter=ConversationId eq 'AAQkADE4ZjA2OWY2LTFmMWQtNDlhZC04Y2E3LTdhNTkxYmQ5MjNkYgAQAD-iMw4fWdNKrhAJFvpN7ak='
// https://outlook.office365.com/api/v1.0/me/messages/AQMkADE4ZjA2OWY2LTFmMWQtNDlhZC04Y2E3LTdhNTkxYmQ5MjNkYgBGAAADjmtaY3ahl0C6Ot4iaTjL_gcA0_Peqbni7EK-MZVPp9BuDwAAAgEMAAAA0_Peqbni7EK-MZVPp9BuDwAAAgFlAAAA/attachments

// AAABAAAAvPM1KaPlrEqdFSBzjqfTGM7BTBzqbTRk9RliKxV_YbetoKrt6LMwlrYfvqrEFOEQ5TyKnGGNE7UMctdsm2LQR0g3RoJ548_QqKRdFociXPAivWRLOGzmh0HElI7n58AP7-8HOeP_uCFR09_op9eQR14ZNb60rE7v-OfyxTIuKzQEEi6phdqJCPQHMik_J84Vadz8HdXXZ6DqYc4qgpn4nfVaNtgd5thQto4yXDJ6lNt4-GaufYibhP_7Fovp771uvGt8SC13QRU2tTTJeXPRwLkw-YvpaO56nVdoW9OjJMqGnQPb3hyN_vjSGwztnCEfRFZZ_vXN2gLhnloq8KLsImvcwb9KbxusIRwrBXFQnWHGWZiIwp3VGFY89YCiLlOYBrX7Enn-yqcj0AfQGttj0bR9Rgc-p8SLMkCeIw25WDDkxjviZgkyoeGenZZvpIgVjrTJnnY7CxUsxUyikvCJUkQlTXLtAeJ82yqelYsdxFeRcGKP-CBh-vRbw6zZF0uiYx7akXi_RRmQ8qqWufZBmB_7OrACihzG43csexSdAgPfGutxpaanRQ9wcQ1eEtRkIAA

request('https://login.windows.net')
    .post('/common/oauth2/token')
    .send(querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: 'AAABAAAAvPM1KaPlrEqdFSBzjqfTGM7BTBzqbTRk9RliKxV_YbetoKrt6LMwlrYfvqrEFOEQ5TyKnGGNE7UMctdsm2LQR0g3RoJ548_QqKRdFociXPAivWRLOGzmh0HElI7n58AP7-8HOeP_uCFR09_op9eQR14ZNb60rE7v-OfyxTIuKzQEEi6phdqJCPQHMik_J84Vadz8HdXXZ6DqYc4qgpn4nfVaNtgd5thQto4yXDJ6lNt4-GaufYibhP_7Fovp771uvGt8SC13QRU2tTTJeXPRwLkw-YvpaO56nVdoW9OjJMqGnQPb3hyN_vjSGwztnCEfRFZZ_vXN2gLhnloq8KLsImvcwb9KbxusIRwrBXFQnWHGWZiIwp3VGFY89YCiLlOYBrX7Enn-yqcj0AfQGttj0bR9Rgc-p8SLMkCeIw25WDDkxjviZgkyoeGenZZvpIgVjrTJnnY7CxUsxUyikvCJUkQlTXLtAeJ82yqelYsdxFeRcGKP-CBh-vRbw6zZF0uiYx7akXi_RRmQ8qqWufZBmB_7OrACihzG43csexSdAgPfGutxpaanRQ9wcQ1eEtRkIAA',
      client_id: config.office365ClientId,
      client_secret: config.office365ClientSecret
    }))
    .end(function(err, req) {
      console.log(err);
      console.log(req && req.body);
    });
