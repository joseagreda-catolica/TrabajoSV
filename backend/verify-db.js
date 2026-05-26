require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function verifyDatabase() {
  try {
    console.log('\n🔍 Verificando Base de Datos...\n');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'portal_trabajo'
    });

    console.log('✅ Conectado a MySQL\n');

    // Ver todas las tablas
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
    );

    console.log(`📋 Tablas en la BD (${tables.length} total):\n`);
    for (let i = 0; i < tables.length; i++) {
      const tableName = tables[i].TABLE_NAME;
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = rows[0].count;
      console.log(`  ${i + 1}. ${tableName.padEnd(20)} (${count} registros)`);
    }

    // Verificar usuario admin
    console.log('\n👤 Usuario Admin:\n');
    const [admin] = await connection.query(
      "SELECT id_usuario, nombre, email, rol FROM usuario WHERE rol = 'admin'"
    );

    if (admin.length > 0) {
      console.log(`  Email: ${admin[0].email}`);
      console.log(`  Nombre: ${admin[0].nombre}`);
      console.log(`  Rol: ${admin[0].rol}`);
      console.log(`  Contraseña: admin123`);
    }

    // Contar usuarios totales
    const [users] = await connection.query("SELECT COUNT(*) as count FROM usuario");
    console.log(`\n👥 Total de usuarios: ${users[0].count}`);

    // Contar vacantes
    const [vacantes] = await connection.query("SELECT COUNT(*) as count FROM vacante");
    console.log(`📢 Total de vacantes: ${vacantes[0].count}`);

    // Contar postulaciones
    const [postulaciones] = await connection.query("SELECT COUNT(*) as count FROM postulacion");
    console.log(`📝 Total de postulaciones: ${postulaciones[0].count}`);

    await connection.end();

    console.log('\n✅ Base de datos verificada y funcionando correctamente\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🚀 Para iniciar el proyecto:\n');
    console.log('Terminal 1 (Backend):');
    console.log('  cd portal-trabajo/backend');
    console.log('  npm run dev\n');
    console.log('Terminal 2 (Frontend):');
    console.log('  cd portal-trabajo/frontend');
    console.log('  npm run dev\n');
    console.log('Luego abre: http://localhost:5173\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error al verificar BD:\n', error.message);
    process.exit(1);
  }
}

verifyDatabase();
