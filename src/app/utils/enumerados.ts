// Enums
export enum Dia {
  'lunes', 'martes', 'miércoles', 'jueves', 'viernes'
}

export enum Sexo {
  'masculino',
  'femenino',
  'otro'
}

export enum EstadoCivil {
  'casado', 'separado', 'divorciado', 'viudo', 'soltero', 'otro'
}

export enum TipoContacto {
  fijo = <any>titleCase('fijo'),
  celular = <any>titleCase('celular'),
  email = <any>titleCase('email')
}

export enum TipoDomicilio {
  real = <any>titleCase('real'),
  legal = <any>titleCase('legal'),
  profesional = <any>titleCase('profesional')
}

export enum TipoTurno {
  matriculacion = <any>'matriculacion',
  renovacion = <any>'renovacion'
}


// Private
export function getEnumAsObjects(enumerado: any) {
  const keys = Object.keys(enumerado);
  const arrNombres = keys.slice(keys.length / 2);
  return arrNombres.map((obj) => {
    return {id: obj, nombre: titleCase(obj)};
  });
};

function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}

// Exports
/*export function getObjsSexo() {
  return getEnumAsObjects(Object.keys(Sexo));
  let arrSexos = Object.keys(Sexo);
  arrSexos = arrSexos.slice(arrSexos.length / 2);
  return arrSexos.map(getObject);
}*/

export function getObjsEstadoCivil() {
  return getEnumAsObjects(Object.keys(EstadoCivil));
  /*let arrEstados = Object.keys(EstadoCivil);
  arrEstados = arrEstados.slice(arrEstados.length / 2);
  let salida = arrEstados.map(elem => { return { 'id': elem, 'nombre': titleCase(elem) } });
  return salida;*/
}

export function getObjDias() {
  return getEnumAsObjects(Object.keys(Dia));
}

export function getObjeto(elemento) {
  return {
    'id': elemento,
    'nombre': titleCase(elemento)
  };
}