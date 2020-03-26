const axios = require("axios")
const request = require("request")
const sha1 = require("js-sha1")
const FormData = require('form-data')
const fs = require('fs')
const { createReadStream } = require('fs')


const api = require('./services/api')

const TOKEN = "b2f92262f536d68df429eb89ece7375c2823ad52"

const challenge = async () => {
  const { data } = await api.get(`/generate-data?token=${TOKEN}`)

  return data
};

const decipher = (alfa, char) => {
  const posAlfa = alfa.indexOf(char)

  if (posAlfa < 0) {
    return char;
  }

  const posDecoded = posAlfa - 3

  if (posDecoded >= 0) {
    return alfa[posDecoded];
  } else {
    return alfa[alfa.length - posDecoded * -1]
  }
}

const decipherChar = (string, numPlaces) => {
  const alfa = new Array(26)
    .fill(null)
    .map((_, index) => String.fromCharCode(97 + index))
  const stringArray = string.toLowerCase().split("")

  const DeciphPhrase = stringArray.reduce((frase, char) => {
    return (frase += decipher(alfa, char))
  }, "")

  return DeciphPhrase
}

const cryptoSummary = string => sha1(string)

const save = (challengeComplete, format = null) => {
  const challengeString = JSON.stringify(challengeComplete, null, format)
  fs.writeFileSync("answer.json", challengeString)
}

const sendData = async () => {

  const readStream = createReadStream('./answer.json');
  
  const form = new FormData();
  form.append('answer', readStream);
  
  const req = request(
    {
      url: `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${TOKEN}`,
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      headers: form.getHeaders(),
    }
    );
    
    form.pipe(req);

}

challenge().then(challenge => {
  const { cifrado, numero_casas } = challenge

  challenge.decifrado = decipherChar(cifrado, 3)

  challenge.resumo_criptografico = cryptoSummary(challenge.decifrado)

  save(challenge, 2)

  sendData()
})
