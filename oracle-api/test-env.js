require('dotenv').config();
console.log('--- ENV TEST ---');
console.log('PORT:', process.env.PORT);
console.log('USER:', process.env.DB_USER);
console.log('STR:', process.env.DB_CONNECT_STRING);
console.log('----------------');
