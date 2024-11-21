const API_URL = "https://6707d1938e86a8d9e42d0fb3.mockapi.io/Tareas"; // URL de mockapi


function showCreateTaskForm() {
  const modal = document.getElementById("create-task-modal");
  modal.showModal();
}


function mostrarFormularioCambiarEstado(id, estado, titulo) {
  const modal = document.getElementById("change-status-modal");
  modal.showModal();
}


function showConfig() {
  const modal = document.getElementById("config-modal");
  modal.showModal();
}


async function obtenerTareas() {
  try {
    const respuesta = await fetch(API_URL);
    if (respuesta.ok) {
      const tareas = await respuesta.json();
      tareas.sort((a, b) => new Date(b.Creadaen) - new Date(a.Creadaen)); 
      mostrarTareas(tareas);
    } else {
      console.error("No se pudo obtener tareas de la API.");
    }
  } catch (error) {
    console.error("Error al cargar las tareas:", error);
  }
}


function mostrarTareas(tareas) {
  const listaTareas = document.getElementById("task-list");
  listaTareas.innerHTML = ""; 

  tareas.forEach((tarea) => {
    const tarjetaTarea = document.createElement("div");
    tarjetaTarea.className = "task-card";
    tarjetaTarea.id = `task-${tarea.id}`;

    let iconoEstado = "";
    let colorEstado = "";
    if (tarea.Estado === "pendiente") {
      iconoEstado = '<i class="fas fa-hourglass-start text-warning"></i>';
      colorEstado = "text-warning";
    } else if (tarea.Estado === "en progreso") {
      iconoEstado = '<i class="fas fa-spinner text-info"></i>';
      colorEstado = "text-info";
    } else if (tarea.Estado === "completada") {
      iconoEstado = '<i class="fas fa-check-circle text-success"></i>';
      colorEstado = "text-success";
    }

  
    let fechaCreacion = new Date(tarea.Creadaen);
    let fechaFormateada = fechaCreacion.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    tarjetaTarea.innerHTML = `
      <div class="task-info">
        <h3>${tarea.Titulo} ${iconoEstado}</h3>
        <p class="${colorEstado}"><strong>Estado:</strong> ${tarea.Estado}</p>
        <p><strong>Fecha de creación:</strong> ${fechaFormateada}</p>
        <p>${tarea.Detalle}</p>
      </div>
      <div class="task-actions">
        <button onclick="reproducirDetalleTarea('${tarea.Titulo}', '${tarea.Detalle}')">
          <i class="bi bi-music-note"></i> Reproducir
        </button>
        <button onclick="eliminarTarea('${tarea.id}')">Eliminar</button>
        <button onclick="mostrarFormularioCambiarEstado('${tarea.id}', '${tarea.Estado}', '${tarea.Titulo}')">Cambiar Estado</button>
      </div>
    `;
    listaTareas.appendChild(tarjetaTarea);
  });
}


async function eliminarTarea(id) {
  if (!id) {
    console.error("ID de tarea no válido");
    return;
  }

  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esta acción",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, borrar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then((respuesta) => {
          if (!respuesta.ok) {
            throw new Error("Error al eliminar la tarea");
          }
          Swal.fire("Borrado", "La tarea ha sido eliminada.", "Éxito");
          document.getElementById(`task-${id}`)?.remove();
        })
        .catch((error) => {
          console.error("Error al eliminar la tarea:", error);
          Swal.fire("Error", "No se pudo eliminar la tarea.", "error");
        });
    }
  });
}


function reproducirDetalleTarea(titulo, detalle) {
  const tareaCard = document.getElementById(`task-${titulo}`);
  if (tareaCard) {
    tareaCard.classList.add("task-playing");
  }

  const utterance = new SpeechSynthesisUtterance(`${titulo}. ${detalle}`);
  utterance.lang = "es-ES";  
  utterance.onend = () => {
    if (tareaCard) {
      tareaCard.classList.remove("task-playing");
    }
  };

  speechSynthesis.speak(utterance);
}

document.addEventListener("DOMContentLoaded", () => {
  obtenerTareas(); 
});
