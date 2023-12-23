// importar modulos
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const crypto = require('crypto');

// crear instancia Express
const app = express();
// definir puerto para el servidor
const port = 3000;

// definir carpeta para archivos estaticos
app.use(express.static('public'));

// habilitar CORS para aceptar solicitudes de diferentes origenes
const cors = require('cors');
app.use(cors());

// configurar bodyParser para los datos de las solicitudes
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// pool para la conexion a la BD
const pool = mysql.createPool({
  connectionLimit: 100,
  host: '85.31.225.145',
  user: 'mamayanomepegues', 
  password: 'papayatrabaja', 
  database: 'IMSS'
});

// inciar servidor
app.listen(port, () => {
    console.log(`El server esta corriendo en el puerto: ${port}`);
});

// Middleware para las sesiones
app.use(session({
    secret: 'tu_secreto_aqui',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: !true }
}));

// verificar si el usuario está logueado
function checkAuthentication(req, res, next) {
  if (req.session.loggedin) {
      next(); // si esta logueado, redirige a la ruta solicitada
  } else {
      res.redirect('/login'); // Si no, redirige a login
  }
}

// ruta del login
app.get('/login_node/login.html', (req, res) => {
  res.sendFile('login.html', { root: './views' });
});

// ruta del index protegida (no se puede acceder a 
// menos que se este logueado) con checkAuthentication
app.get('/', checkAuthentication, (req, res) => {
  res.sendFile('index.html', { root: './views' });
});

// lo mismo que la anterior pero bloquea el acceso directo al archivo
app.get('/index.html', checkAuthentication, (req, res) => {
  res.sendFile('index.html', { root: './views' });
});

// obtener datos del form para iniciar sesion
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    pool.getConnection((err, conn) => {
        if(err) throw err;

        const sha1Password = crypto.createHash('sha1').update(password).digest('hex');
        // consulta para obtener usuario y contrasena
        conn.query('SELECT * FROM cuenta WHERE usuario = ? AND contraseña = ?', [username, sha1Password], (error, results) => {
            conn.release();
            if(error) {
                res.status(500).send('Error al consultar la base de datos');
                return;
            }

            if (results.length === 0) {
                // los datos no coinciden
                res.status(401).send('Nombre de usuario o contrasena incorrectas');
            } else {
                // los datos si coinciden
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/index.html'); // redireccionar a la pagina principal
            }
        });
    });
});

// endpoint para obtener citas de la BD
app.get('/get-appointments', checkAuthentication, (req, res) => {
    pool.getConnection((err, conn) => {
        if (err) throw err; // lanzar error
    
        conn.query('SELECT * FROM cita', (error, results) => {
          conn.release(); // Siempre devuelve la conexión al pool después de la consulta -- duda
    
          if (error) {
            res.status(500).send({ message: 'Error al obtener citas', error: error });
          } else {
            res.send(results);
          }
        });
      });
});


// endpoint para agregar citas -- duda
app.post('/add-appointment', (req, res) => {
  const { sala_id, empleado_matricula, registro_expediente_id, fecha_hora, nivel_urgencia, tipo_cita, servicio_id } = req.body;
  pool.getConnection((err, conn) => {
    if (err) throw err;
    conn.query('CALL sp_AgregarCita(?,?,?,?,?,?,?)', [sala_id, empleado_matricula, registro_expediente_id, fecha_hora, nivel_urgencia, tipo_cita, servicio_id], (error, results) => {
      conn.release();
      if (error) {
        return res.status(500).send({ message: 'Error al agregar cita', error: error });
      }
      res.send({ status: 'success', message: 'Cita agregada correctamente' });
    });
  });
});

  
// endpoint para actualizr/modificar cita
app.put('/update-appointment/:id', (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err;
        
        const params = req.body;

        connection.query('CALL sp_ActualizarCita(?,?,?,?)', [
            params.id,
            params.sala_id, 
            params.empleado_matricula, 
            params.fecha_hora
          ], (error, results) => {
              connection.release();
              if(error) {
                res.send({ status: 0, message: 'Error al modificar: ', error: error }); // -- duda
              } else {
                  res.send({ status: 1, message: 'Cita modificada con exito!' }); // -- duda
              }
          });
    });
});

  
// endpoint para eliminar una cita -- duda
app.delete('/delete-appointment/:id', (req, res) => {
  const cita_id = req.params.id;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query('CALL sp_EliminarCita(?)', [cita_id], (error, results) => {
      connection.release();
      if (error) {
        return res.status(500).send({ message: 'Error al eliminar cita', error: error });
      }
      res.send({ status: 'success', message: 'Cita eliminada correctamente' });
    });
  });
});
