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

    const citaId = document.getElementById('cita_id').value; // Obtén el ID de la cita
    const isEditing = citaId !== ''; // Estás editando si citaId no está vacío
  
    // Configura la URL y el método dependiendo de si estás agregando o editando
    const url = isEditing ? `http://localhost:3000/update-appointment/${citaId}` : 'http://localhost:3000/add-appointment';
    const method = isEditing ? 'PUT' : 'POST';

    // Gather form data
    const formData = {
    sala_id: document.getElementById('sala_id').value,
    empleado_matricula: document.getElementById('empleado_matricula').value,
    registro_expediente_id: document.getElementById('registro_expediente_id').value, // Actualizado para coincidir con el HTML
    fecha_hora: document.getElementById('fecha_hora').value,
    nivel_urgencia: document.getElementById('nivel_urgencia').value,
    tipo_cita: document.getElementById('tipo_cita').value,
    servicio_id: document.getElementById('servicio_id').value // Actualizado para coincidir con el HTML
    };


    // Send the data using fetch
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
        // Here you can update the frontend to show the new appointment
        // Close the modal
        closeModal();
        // Reset the form
        document.getElementById('appointment-form').reset();
        document.getElementById('registro_expediente_id').disabled = false;
        document.getElementById('nivel_urgencia').disabled = false;
        document.getElementById('tipo_cita').disabled = false;
        document.getElementById('servicio_id').disabled = false;
        document.getElementById('save-appointment-btn').textContent = 'Agregar cita';
        document.getElementById('modal-title').textContent = 'Agregar cita';
        document.getElementById('cita_id').value = '';
        document.getElementById('label_cita_id').style.display = 'none';
        // Reload or update your appointments table
        loadAppointments();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// Format the time for the input html
function formatDateTimeForInput(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16);
}
  
function deleteAppointment(appointmentId) {
  if (confirm('Are you sure you want to delete this appointment?')) {
    fetch(`http://localhost:3000/delete-appointment/${appointmentId}`, {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Delete successful', data);
      // Remove the appointment row from the table or reload appointments
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
    console.log('row -> ', row)
    if (row) {
        document.getElementById('modal-title').textContent = 'Editar Cita';
        document.getElementById('cita_id').value = appointmentId;
        document.getElementById('sala_id').value = row.cells[1].textContent;
        document.getElementById('empleado_matricula').value = row.cells[2].textContent;
        document.getElementById('fecha_hora').value = formatDateTimeForInput(row.cells[4].textContent);
        // Los siguientes campos estarán deshabilitados
        document.getElementById('registro_expediente_id').value = row.cells[3].textContent;
        document.getElementById('nivel_urgencia').value = row.cells[5].textContent;
        document.getElementById('tipo_cita').value = row.cells[6].textContent;
        document.getElementById('servicio_id').value = row.cells[7].textContent;
        
        // Deshabilitar campos que no se pueden editar
        document.getElementById('cita_id').disabled = true
        document.getElementById('registro_expediente_id').disabled = true;
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
    fetch('http://localhost:3000/get-appointments')
    .then(response => response.json())
    .then(appointments => {
    const tableBody = document.getElementById('appointment-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear current table body
    // Populate table with new data
    appointments.forEach(appointment => {
      tableBody.innerHTML += `
        <tr data-cita-id="${appointment.cita_id}">
          <td>${appointment.cita_id}</td>
          <td>${appointment.sala_id}</td>
          <td>${appointment.empleado_matricula}</td>
          <td>${appointment.registro_expediente_id}</td>
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
    console.error('Error loading appointments:', error);
  });
}

function updateTable() {
  fetch('http://localhost:3000/get-appointments')
    .then(response => response.json())
    .then(appointments => {
      const tableBody = document.getElementById('appointment-table').querySelector('tbody');
      tableBody.innerHTML = ''; // Clear current table body

      appointments.forEach(appointment => {
        const row = `
          <tr data-cita-id="${appointment.cita_id}">
            <td>${appointment.cita_id}</td>
            <td>${appointment.sala_id}</td>
            <td>${appointment.empleado_matricula}</td>
            <td>${appointment.registro_expediente_id}</td>
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
  row.setAttribute('data-cita-id', appointment.cita_id); // Setting the unique identifier

  row.innerHTML = `
    <td>${appointment.cita_id}</td>
    <td>${appointment.sala_id}</td>
    <td>${appointment.empleado_matricula}</td>
    <td>${appointment.registro_expediente_id}</td>
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
      <td>${appointment.registro_expediente_id}</td>
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
        row.remove(); // This will remove the row from the table
    }
}