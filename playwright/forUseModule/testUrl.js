import fetch from 'node-fetch'
import * as https from 'https'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

async function testFetch() {
  try {
    const response = await fetch('https://cashless.tibillet.localhost', {agent: httpsAgent})
    const data = await response.text()
    console.log('data =', data)
  } catch (e) {
    console.log('error =', e)
  }
}

testFetch()
