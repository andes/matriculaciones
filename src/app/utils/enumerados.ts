// Enums
export enum Dia {
    'lunes', 'martes', 'miércoles', 'jueves', 'viernes'
}

export enum EstadoMatricula {
    'todos', 'suspendidas', 'vigentes'
}

export enum Sexo {
    'masculino',
    'femenino',
    'otro'
}

export enum TipoDoc {
    'DNI',
    'LE',
    'LC'
}

export enum tipoComunicacion {
    'Teléfono Fijo',
    'Teléfono Celular',
    'Email'
}

export enum EstadoCivil {
    'casado', 'separado', 'divorciado', 'viudo', 'soltero', 'otro'
}

export enum guiaProfesional {
    'Documento', 'Profesión y N° de matrícula', 'Nombre, apellido y profesión'
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


export enum TipoCopiaCredencial {
    'Duplicado', 'Triplicado'
}
export enum TipoMatricula {
    'grado', 'posgrado'
}


// Private
export function getEnumAsObjects(enumerado: any) {
    const keys = Object.keys(enumerado);
    const arrNombres = keys.slice(keys.length / 2);
    return arrNombres.map((obj) => {
        return { id: obj, nombre: titleCase(obj) };
    });
}


function titleCase(str) {
    return str.toLowerCase().split(' ').map(function (word) {
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
export function getTiposMatricula() {
    let arrEstadoC = Object.keys(TipoMatricula);
    arrEstadoC = arrEstadoC.slice(arrEstadoC.length / 2);
    const salida = arrEstadoC.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}
export function getEstadoCivil() {
    let arrEstadoC = Object.keys(EstadoCivil);
    arrEstadoC = arrEstadoC.slice(arrEstadoC.length / 2);
    return arrEstadoC;
}

export function getObjsEstadoCivil() {
    let arrEstadoC = Object.keys(EstadoCivil);
    arrEstadoC = arrEstadoC.slice(arrEstadoC.length / 2);
    const salida = arrEstadoC.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}

export function getObjDias() {
    let arrEstadoC = Object.keys(Dia);

    arrEstadoC = arrEstadoC.slice(arrEstadoC.length / 2);
    const salida = arrEstadoC.map((elem, index) => {
        return {
            'id': index,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}

export function getObjEstadosMatriculas() {
    let arrEstadoC = Object.keys(EstadoMatricula);

    arrEstadoC = arrEstadoC.slice(arrEstadoC.length / 2);
    const salida = arrEstadoC.map((elem, index) => {
        return {
            'id': index,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}


export function getObjGuiaProfesional() {
    let array = Object.keys(guiaProfesional);

    array = array.slice(array.length / 2);
    const salida = array.map((elem, index) => {
        return {
            'id': index,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}
export function getCopiasCredencial() {
    let arrTipoCopiaCredencial = Object.keys(TipoCopiaCredencial);
    arrTipoCopiaCredencial = arrTipoCopiaCredencial.slice(arrTipoCopiaCredencial.length / 2);
    const salida = arrTipoCopiaCredencial.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}



export function getObjSexos() {
    let arrSexo = Object.keys(Sexo);
    arrSexo = arrSexo.slice(arrSexo.length / 2);
    const salida = arrSexo.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}

export function getObjTipoDoc() {
    let arrTipoDoc = Object.keys(TipoDoc);
    arrTipoDoc = arrTipoDoc.slice(arrTipoDoc.length / 2);
    const salida = arrTipoDoc.map(elem => {
        return {
            'id': elem,
            'nombre': elem
        };
    });
    return salida;
}

export function getObjeto(elemento) {
    return {
        'id': elemento,
        'nombre': titleCase(elemento)
    };
}
export function getObjTipoComunicacion() {
    let arrTC = Object.keys(tipoComunicacion);
    arrTC = arrTC.slice(arrTC.length / 2);
    const salida = arrTC.map(elem => {
        const idEnumerado = elem.split(' ')[1] ? elem.split(' ')[1] : elem.split(' ')[0];
        return {
            'id': idEnumerado.toLowerCase(),
            'nombre': titleCase(elem)
        };
    });
    return salida;
}

export function getObjTipoDomicilio() {
    let arrEstadoC = Object.keys(TipoDomicilio);
    arrEstadoC = arrEstadoC.slice(arrEstadoC.length / 2);
    const salida = arrEstadoC.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}
