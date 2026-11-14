/* ================================================================
   CERCO · SUELDOS DE REFERENCIA (un solo sitio para las cifras)
   ----------------------------------------------------------------
   Referencia orientativa del sector, en euros brutos al año y para
   jornada completa. Tres tramos por experiencia:
     [hasta 2 años], [de 2 a 5 años], [más de 5 años]
   Para cambiar una cifra, cámbiala aquí: la usan los dos lados
   (sugerencias al crear una oferta, la comparación del sueldo y la
   guía salarial del profesional).
   Sin cifras (bandas: null) = sin sugerencia por ahora.
   «odonto: true» añade la nota de que muchos cobran un porcentaje.
   Fuentes (revisadas en noviembre de 2026): EmpleoDental, Indeed,
   Glassdoor, Laboria, Nubidoc, blogs de clínicas y convenios
   provinciales. Ver PROGRESO.md.
   ================================================================ */
window.CERCO_SUELDOS = {
  titulo: 'Referencia orientativa del sector',
  notaOdonto: 'Muchos cobran un porcentaje de lo que facturan.',
  tramos: ['hasta 2 años', 'de 2 a 5 años', 'más de 5 años'],
  // El orden importa: se mira de arriba abajo y vale el primero que encaja con el puesto.
  puestos: [
    { puesto: 'Cirujano/a oral y maxilofacial', plural: 'cirujanos orales', re: /ciruj|maxilofac/i, odonto: true,
      bandas: [[60000, 75000], [75000, 90000], [90000, 120000]] },
    { puesto: 'Implantólogo/a', plural: 'implantólogos', re: /implant/i, odonto: true,
      bandas: [[45000, 60000], [60000, 75000], [75000, 100000]] },
    { puesto: 'Periodoncista', plural: 'periodoncistas', re: /periodon/i, odonto: true,
      bandas: [[35000, 45000], [45000, 55000], [55000, 70000]] },
    { puesto: 'Endodoncista', plural: 'endodoncistas', re: /endodon/i, odonto: true,
      bandas: [[30000, 40000], [40000, 50000], [50000, 60000]] },
    { puesto: 'Odontopediatra', plural: 'odontopediatras', re: /odontopediat|pediatr/i, odonto: true,
      bandas: [[32000, 40000], [40000, 50000], [50000, 65000]] },
    { puesto: 'Prostodoncista', plural: 'prostodoncistas', re: /prostodon/i, odonto: true,
      bandas: null },
    { puesto: 'Ortodoncista', plural: 'ortodoncistas', re: /ortodon/i, odonto: true,
      bandas: [[35000, 50000], [50000, 65000], [65000, 85000]] },
    { puesto: 'Protésico/a dental', plural: 'protésicos', re: /prot[eé]sic|laboratorio/i,
      bandas: [[17000, 20000], [20000, 23000], [23000, 27000]] },
    { puesto: 'Higienista dental', plural: 'higienistas', re: /higien/i,
      bandas: [[18000, 21000], [21000, 25000], [25000, 32000]] },
    { puesto: 'Auxiliar de clínica dental', plural: 'auxiliares', re: /auxiliar|asistente|ayudante/i,
      bandas: [[15000, 17500], [17500, 20000], [20000, 23000]] },
    { puesto: 'Asesor/a de pacientes', plural: 'asesores de pacientes', re: /asesor/i,
      bandas: null },
    { puesto: 'Recepcionista de clínica dental', plural: 'recepcionistas', re: /recepci|atenci[oó]n al paciente|administrativ/i,
      bandas: [[16000, 18500], [18500, 21000], [21000, 25000]] },
    { puesto: 'Gerente de clínica dental', plural: 'gerentes', re: /gerent|gerencia|direct/i,
      bandas: null },
    { puesto: 'Coordinador/a de clínica', plural: 'coordinadores', re: /coordina|responsable/i,
      bandas: [[22000, 28000], [28000, 35000], [32000, 42000]] },
    { puesto: 'Odontólogo/a general', plural: 'odontólogos', re: /odont|dentist|est[eé]tica/i, odonto: true,
      bandas: [[30000, 40000], [40000, 55000], [55000, 70000]] }
  ]
};
// La referencia de un puesto (por su título), o null si no tiene cifras.
window.CERCO_sueldoDe = function(titulo){
  var t = String(titulo || '');
  if(!t.trim()) return null;
  var l = window.CERCO_SUELDOS.puestos;
  for(var i = 0; i < l.length; i++){
    if(l[i].re.test(t)) return l[i].bandas ? l[i] : null;
  }
  return null;
};
// El rango completo (del mínimo del primer tramo al máximo del último)
window.CERCO_sueldoRango = function(titulo){
  var r = window.CERCO_sueldoDe(titulo); if(!r) return null;
  return [r.bandas[0][0], r.bandas[r.bandas.length - 1][1]];
};
