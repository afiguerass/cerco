// Pone el módulo del test DISC al alcance del código de las páginas, que de
// momento sigue usando funciones globales (se ordenará en pasos siguientes).
import { LETRAS, calcularPerfil, barajarPreguntas, perfilesDeOferta, porcentajeEncaje } from './disc.js';

window.CERCO_DISC = { LETRAS, calcularPerfil, barajarPreguntas, perfilesDeOferta, porcentajeEncaje };
window.CERCO_discCalc = calcularPerfil;
window.CERCO_discBarajar = barajarPreguntas;
window.CERCO_encaje = porcentajeEncaje;
window.CERCO_perfilesDeOferta = perfilesDeOferta;
