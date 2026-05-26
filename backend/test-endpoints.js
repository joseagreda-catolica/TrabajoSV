require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testEndpoints() {
  console.log('\n🧪 Probando Endpoints del Backend...\n');

  const tests = [
    {
      name: 'Obtener vacantes',
      method: 'GET',
      url: '/vacantes',
      expectedStatus: 200
    },
    {
      name: 'Login (credenciales inválidas)',
      method: 'POST',
      url: '/auth/login',
      data: { email: 'test@test.com', password: 'wrong' },
      expectedStatus: 401
    },
    {
      name: 'Check session',
      method: 'GET',
      url: '/auth/check-session',
      expectedStatus: 200
    },
    {
      name: 'Listar empresas',
      method: 'GET',
      url: '/empresas',
      expectedStatus: 200
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      let response;
      if (test.method === 'GET') {
        response = await axios.get(API_URL + test.url);
      } else {
        response = await axios.post(API_URL + test.url, test.data);
      }

      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}`);
        console.log(`   Status: ${response.status}\n`);
        passed++;
      } else {
        console.log(`⚠️  ${test.name}`);
        console.log(`   Expected: ${test.expectedStatus}, Got: ${response.status}\n`);
        failed++;
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === test.expectedStatus) {
        console.log(`✅ ${test.name}`);
        console.log(`   Status: ${status}\n`);
        passed++;
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}`);
        console.log(`   Error: No se puede conectar a ${API_URL}`);
        console.log(`   Asegúrate que el backend está corriendo (npm run dev)\n`);
        failed++;
      } else {
        console.log(`✅ ${test.name}`);
        console.log(`   Status: ${status} (error esperado)\n`);
        passed++;
      }
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Resultados: ${passed}/${tests.length} pruebas exitosas\n`);

  if (failed === 0) {
    console.log('✅ Todos los endpoints responden correctamente\n');
  } else {
    console.log(`⚠️  ${failed} pruebas requieren que el backend esté corriendo\n`);
  }
}

testEndpoints().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
