// Get modal element
var modal = document.getElementById("modal");
// Get open modal button
var btn = document.getElementById("add-appointment-btn");
// Get close button
var closeBtn = document.getElementsByClassName("close-btn")[0];

// Listen for open click
btn.addEventListener("click", openModal);
// Listen for close click
closeBtn.addEventListener("click", closeModal);
// Listen for outside click
window.addEventListener("click", outsideClick);

// Function to open modal
function openModal(){
  modal.style.display = "block";
}

// Function to close modal
function closeModal(){
  modal.style.display = "none";
}

// Function to close modal if outside click
function outsideClick(e){
  if(e.target == modal){
    modal.style.display = "none";
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadAppointments();
});

document.getElementById('appointment-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const citaId = document.getElementById('cita_id').value; // Obten el ID de la cita
    const isEditing = citaId !== ''; // Estas editando si citaId no esta vacio
  
    // Cambiar URL si esta editando o agregando
    const url = isEditing ? `/update-appointment/${citaId}` : '/add-appointment';
    const method = isEditing ? 'PUT' : 'POST';

    const formData = {
    sala_id: document.getElementById('sala_id').value,
    empleado_matricula: document.getElementById('empleado_matricula').value,
    fecha_hora: document.getElementById('fecha_hora').value,
    nivel_urgencia: document.getElementById('nivel_urgencia').value,
    tipo_cita: document.getElementById('tipo_cita').value,
    servicio_id: document.getElementById('servicio_id').value
    };

    // Enviar informacion
    fetch(url, {
        method: method,
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        closeModal();
        document.getElementById('appointment-form').reset();
        document.getElementById('nivel_urgencia').disabled = false;
        document.getElementById('tipo_cita').disabled = false;
        document.getElementById('servicio_id').disabled = false;
        document.getElementById('save-appointment-btn').textContent = 'Agregar cita';
        document.getElementById('modal-title').textContent = 'Agregar cita';
        document.getElementById('cita_id').value = '';
        document.getElementById('label_cita_id').style.display = 'none';
        // Cargar/Recargar las citas
        loadAppointments();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// Formato para que fecha_hora coinicida con el de datetime-local
function formatDateTimeForInput(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16);
}
  
function deleteAppointment(appointmentId) {
  if (confirm('Estas seguro de eliminar esta cita?')) {
    fetch(`/delete-appointment/${appointmentId}`, {
      method: 'DELETE',
    })
    .then(response => {
      // Comprobar si la respuesta del servidor es exitosa
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      return response.json();
    })
    .then(data => {
      if (data.status !== 'success') {
        throw new Error(data.message);
      }
      console.log('Eliminación exitosa!', data);
      loadAppointments();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
}


function editAppointment(appointmentId) {
  // Mostrar el modal
  openModal();
  // Obtén los datos de la cita desde el frontend o haz una solicitud al backend.
  // Por simplicidad, supondremos que obtienes los datos de la tabla.
  const row = document.querySelector(`tr[data-cita-id="${appointmentId}"]`);
  if (row) {
    document.getElementById('modal-title').textContent = 'Editar Cita';
    document.getElementById('cita_id').value = appointmentId;
    document.getElementById('sala_id').value = row.cells[1].textContent;
    document.getElementById('empleado_matricula').value = row.cells[2].textContent;
    document.getElementById('fecha_hora').value = formatDateTimeForInput(row.cells[3].textContent);
    document.getElementById('nivel_urgencia').value = row.cells[4].textContent;
    document.getElementById('tipo_cita').value = row.cells[5].textContent;
    document.getElementById('servicio_id').value = row.cells[6].textContent;
    
    // Deshabilitar campos que no se pueden editar
    document.getElementById('cita_id').disabled = true;
    document.getElementById('nivel_urgencia').disabled = true;
    document.getElementById('tipo_cita').disabled = true;
    document.getElementById('servicio_id').disabled = true;
        
    // Mostrar input cita
    document.getElementById('label_cita_id').style.display = 'block';
    document.getElementById('cita_id').type = 'text';
    // Cambiar el texto del botón de envío
    document.getElementById('save-appointment-btn').textContent = 'Guardar Cambios';
  }
}

function loadAppointments() {
    fetch('/get-appointments')
    .then(response => response.json())
    .then(appointments => {
    const tableBody = document.getElementById('appointment-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Limpiar el cuerpo de la tabla
    // Mostrar nueva informacion
    appointments.forEach(appointment => {
      tableBody.innerHTML += `
        <tr data-cita-id="${appointment.cita_id}">
          <td>${appointment.cita_id}</td>
          <td>${appointment.sala_id}</td>
          <td>${appointment.empleado_matricula}</td>
          <td>${appointment.fecha_hora}</td>
          <td>${appointment.nivel_urgencia}</td>
          <td>${appointment.tipo_cita}</td>
          <td>${appointment.servicio_id}</td>
          <td>
            <button onclick="editAppointment(${appointment.cita_id})">Editar</button>
            <button onclick="deleteAppointment(${appointment.cita_id})">Eliminar</button>
          </td>
        </tr>
      `;
    });
  })
  .catch(error => {
    console.error('Error al cargar las citas:', error);
  });
}

function updateTable() {
  fetch('/get-appointments')
    .then(response => response.json())
    .then(appointments => {
      const tableBody = document.getElementById('appointment-table').querySelector('tbody');
      tableBody.innerHTML = ''; // Limpiar tabla

      appointments.forEach(appointment => {
        const row = `
          <tr data-cita-id="${appointment.cita_id}">
            <td>${appointment.cita_id}</td>
            <td>${appointment.sala_id}</td>
            <td>${appointment.empleado_matricula}</td>
            <td>${appointment.fecha_hora}</td>
            <td>${appointment.nivel_urgencia}</td>
            <td>${appointment.tipo_cita}</td>
            <td>${appointment.servicio_id}</td>
            <td>
              <button onclick="editAppointment(${appointment.cita_id})">Editar</button>
              <button onclick="deleteAppointment(${appointment.cita_id})">Eliminar</button>
            </td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function addTableRow(appointment) {
  const tableBody = document.getElementById('appointment-table').querySelector('tbody');
  const row = document.createElement('tr');
  row.setAttribute('data-cita-id', appointment.cita_id);

  row.innerHTML = `
    <td>${appointment.cita_id}</td>
    <td>${appointment.sala_id}</td>
    <td>${appointment.empleado_matricula}</td>
    <td>${appointment.fecha_hora}</td>
    <td>${appointment.nivel_urgencia}</td>
    <td>${appointment.tipo_cita}</td>
    <td>${appointment.servicio_id}</td>
    <td>
      <button onclick="editAppointment(${appointment.cita_id})">Editar</button>
      <button onclick="deleteAppointment(${appointment.cita_id})">Eliminar</button>
    </td>
  `;
  tableBody.appendChild(row);
}


function updateTableRow(appointment) {
  const row = document.querySelector(`tr[data-cita-id="${appointment.cita_id}"]`);
  if (row) {
    row.innerHTML = `
      <td>${appointment.cita_id}</td>
      <td>${appointment.sala_id}</td>
      <td>${appointment.empleado_matricula}</td>
      <td>${appointment.fecha_hora}</td>
      <td>${appointment.nivel_urgencia}</td>
      <td>${appointment.tipo_cita}</td>
      <td>${appointment.servicio_id}</td>
      <td>
        <button onclick="editAppointment(${appointment.cita_id})">Editar</button>
        <button onclick="deleteAppointment(${appointment.cita_id})">Eliminar</button>
      </td>
    `;
  }
}

function deleteTableRow(citaId) {
    const row = document.querySelector(`tr[data-cita-id="${citaId}"]`);
    if (row) {
        row.remove();
    }
}