require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function setupDatabase() {
  const schemaPath = path.join(__dirname, 'database', 'schema.sql');

  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Archivo schema.sql no encontrado');
    process.exit(1);
  }

  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

  try {
    console.log('📦 Conectando a MySQL...');

    // Conexión inicial para crear BD
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('✅ Conectado a MySQL\n');

    console.log('🔨 Creando base de datos y tablas...\n');
    await connection.query(schemaSQL);

    console.log('✅ Base de datos creada correctamente\n');

    // Verificar tablas
    console.log('📋 Verificando tablas creadas...\n');
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [process.env.DB_NAME || 'portal_trabajo']
    );

    if (tables.length > 0) {
      console.log('Tablas creadas:');
      tables.forEach((table, i) => {
        console.log(`  ${i + 1}. ${table.TABLE_NAME}`);
      });
      console.log(`\n✅ Total: ${tables.length} tablas creadas\n`);
    }

    // Verificar datos iniciales
    console.log('👤 Verificando admin por defecto...');
    const [admin] = await connection.query(
      "SELECT * FROM usuario WHERE rol = 'admin' LIMIT 1"
    );

    if (admin.length > 0) {
      console.log('✅ Admin encontrado:');
      console.log(`   Email: ${admin[0].email}`);
      console.log(`   Contraseña: admin123\n`);
    }

    await connection.end();

    console.log('🎉 Setup completado exitosamente\n');
    console.log('Puedes iniciar el backend con: npm run dev');

  } catch (error) {
    console.error('\n❌ Error durante el setup:\n', error.message);
    console.error('\nPosibles soluciones:');
    console.error('1. Verifica que MySQL está corriendo');
    console.error('2. Verifica las credenciales en .env:');
    console.error(`   - DB_HOST: ${process.env.DB_HOST}`);
    console.error(`   - DB_USER: ${process.env.DB_USER}`);
    console.error(`   - DB_PASSWORD: ${process.env.DB_PASSWORD ? '(configurada)' : '(vacía)'}`);
    console.error(`3. Intenta crear manualmente: mysql -u root -p < database/schema.sql`);
    process.exit(1);
  }
}

setupDatabase();
