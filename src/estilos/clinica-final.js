// Estilos del lado clínica que antes estaban dentro del <body>, al final de la
// página. Se añaden al final del <body> para que se apliquen en el mismo orden
// que antes, por detrás de los estilos que añade el propio código en la
// cabecera. Así la web se ve exactamente igual.
import css from './clinica-final.css?inline';

const estilo = document.createElement('style');
estilo.textContent = css;
document.body.appendChild(estilo);
