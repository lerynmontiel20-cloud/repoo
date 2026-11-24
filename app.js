// 1. Configuración de conexión a Supabase
const SUPABASE_URL ='https://ekgnewpvnratmvxhnnvt.supabase.co'; 

///https://supabase.com/dashboard/project/ekgnewpvnratmvxhnnvt; 

////'https://ekgnewpvnratmvxhnnvt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZ25ld3B2bnJhdG12eGhubnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0Nzg3MzksImV4cCI6MjExMTA1NDczOX0.9WnNyCYiobx7iJy4cdUr5LxfJ5NSp6j7_7Upzq2MWk0';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Referencias del DOM
const form = document.getElementById('radio-form');
const formTitle = document.getElementById('form-title');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const tablaProgramas = document.getElementById('tabla-programas');
const filtroGenero = document.getElementById('filtro-genero');
const inputId = document.getElementById('registro-id');
const inputPrograma = document.getElementById('programa');
const inputGenero = document.getElementById('genero');
const inputAlias = document.getElementById('alias_conductor');
const inputFecha = document.getElementById('fecha');
const inputDuracion = document.getElementById('duracion_minutos');

// 2. Listar y Filtrar registros desde Supabase
async function cargarProgramas() {
  const generoSeleccionado = filtroGenero.value;

  let query = supabaseClient
    .from('programacion_radio')
    .select('*')
    .order('fecha', { ascending: true });

  // Si hay un género seleccionado distinto de "Todos", filtramos
  if (generoSeleccionado !== 'Todos') {
    query = query.eq('genero', generoSeleccionado);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al cargar programas:', error.message);
    alert('Error al cargar los datos de Supabase.');
    return;
  }

  renderizarTabla(data);
}

// Dibujar filas en la tabla HTML
function renderizarTabla(lista) {
  tablaProgramas.innerHTML = '';

  if (lista.length === 0) {
    tablaProgramas.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;">No hay programas registrados para este filtro.</td>
      </tr>
    `;
    return;
  }

  lista.forEach((item) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><strong>${item.programa}</strong></td>
      <td><span class="badge">${item.genero}</span></td>
      <td>${item.alias_conductor}</td>
      <td>${item.fecha}</td>
      <td>${item.duracion_minutos} min</td>
      <td>
        <button class="btn-edit" onclick="prepararEdicion(${item.id}, '${item.programa.replace(/'/g, "\\'")}', '${item.genero}', '${item.alias_conductor.replace(/'/g, "\\'")}', '${item.fecha}', ${item.duracion_minutos})">Editar</button>
        <button class="btn-delete" onclick="eliminarPrograma(${item.id})">Eliminar</button>
      </td>
    `;
    tablaProgramas.appendChild(fila);
  });
}

// 3. Crear o Modificar registro
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const datosPrograma = {
    programa: inputPrograma.value.trim(),
    genero: inputGenero.value,
    alias_conductor: inputAlias.value.trim(),
    fecha: inputFecha.value,
    duracion_minutos: parseInt(inputDuracion.value)
  };

  const idEditar = inputId.value;

  if (idEditar) {
    // MODIFICAR (UPDATE)
    const { error } = await supabaseClient
      .from('programacion_radio')
      .update(datosPrograma)
      .eq('id', idEditar);

    if (error) {
      alert('Error al modificar: ' + error.message);
      return;
    }
    resetearFormulario();
  } else {
    // CREAR (INSERT)
    const { error } = await supabaseClient
      .from('programacion_radio')
      .insert([datosPrograma]);

    if (error) {
      alert('Error al guardar: ' + error.message);
      return;
    }
    form.reset();
  }

  cargarProgramas();
});

// 4. Cargar datos en el formulario para editar
function prepararEdicion(id, programa, genero, alias, fecha, duracion) {
  inputId.value = id;
  inputPrograma.value = programa;
  inputGenero.value = genero;
  inputAlias.value = alias;
  inputFecha.value = fecha;
  inputDuracion.value = duracion;

  formTitle.textContent = 'Modificar Programa';
  btnGuardar.textContent = 'Actualizar Cambios';
  btnCancelar.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetearFormulario() {
  form.reset();
  inputId.value = '';
  formTitle.textContent = 'Registrar Nuevo Programa';
  btnGuardar.textContent = 'Guardar Programa';
  btnCancelar.classList.add('hidden');
}

btnCancelar.addEventListener('click', resetearFormulario);

// 5. Eliminar registro
async function eliminarPrograma(id) {
  const confirmar = confirm('¿Estás segura de que querés eliminar este programa de la agenda?');
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from('programacion_radio')
    .delete()
    .eq('id', id);

  if (error) {
    alert('Error al eliminar: ' + error.message);
    return;
  }

  cargarProgramas();
}

// Evento del filtro por género
filtroGenero.addEventListener('change', cargarProgramas);

// Cargar datos apenas abre la página
document.addEventListener('DOMContentLoaded', cargarProgramas);