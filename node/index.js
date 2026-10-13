const http = require('node:http');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

const names = ['Wesley', 'Luiz', 'Ana', 'Joao', 'Maria'];

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

const server = http.createServer(async (_request, response) => {
  try {
    const name = names[Math.floor(Math.random() * names.length)];
    await pool.execute('INSERT INTO people (name) VALUES (?)', [name]);
    const [people] = await pool.query('SELECT name FROM people ORDER BY id');
    const peopleList = people.map(({ name: personName }) => `<li>${escapeHtml(personName)}</li>`).join('\n');

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(`<h1>Full Cycle Rocks!</h1>\n<ul>\n${peopleList}\n</ul>`);
  } catch (error) {
    console.error('Erro ao consultar o banco de dados:', error);
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Erro ao carregar os nomes.');
  }
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Aplicacao disponivel na porta 3000.');
});