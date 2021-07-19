/* eslint-disable @typescript-eslint/restrict-plus-operands */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const numberToText = (n, params) => {
  let numero = parseInt(n + '')

  let respuesta = ''

  if (numero > 999) {
    if ((numero + '').length > 6) {
      let residuo = parseInt(numero + '') % 1000000
      let x = parseInt(numero / 1000000)

      if (x === 1) {
        respuesta = ' UN MILLON ' + numberToText(residuo)
      } else {
        respuesta = numberToText(x) + ' MILLONES ' + numberToText(residuo)
      }
    } else if ((numero + '').length > 3) {
      let residuo = parseInt(numero + '') % 1000
      let x = parseInt(numero / 1000)

      if (x === 1) {
        respuesta = ' MIL' + numberToText(residuo)
      } else {
        respuesta = numberToText(x) + ' MIL ' + numberToText(residuo)
      }
    }
  } else {
    if (numero === 100) {
      respuesta = 'CIEN'
    } else if (numero > 100) {
      let cen = parseInt(numero / 100)
      let dec = numero % 100

      respuesta = ' ' + centenasNal(cen) + ' ' + numberToText(dec)
    } else {
      let dec = numero % 100

      if (dec < 20) {
        respuesta = ' ' + unidadesNal(dec)
      } else {
        let unis = dec % 10
        let ddec = parseInt(dec / 10)

        if (unis !== 0) {
          respuesta = ' ' + decenasNal(ddec) + ' Y ' + unidadesNal(unis)
        } else {
          respuesta = ' ' + decenasNal(ddec)
        }
      }
    }
  }

  return respuesta
}

export function unidadesNal (n) {
  if (n + '' === '1') {
    return 'UNO'
  }
  if (n + '' === '2') {
    return 'DOS'
  }
  if (n + '' === '3') {
    return 'TRES'
  }
  if (n + '' === '4') {
    return 'CUATRO'
  }
  if (n + '' === '5') {
    return 'CINCO'
  }
  if (n + '' === '6') {
    return 'SEIS'
  }
  if (n + '' === '7') {
    return 'SIETE'
  }
  if (n + '' === '8') {
    return 'OCHO'
  }
  if (n + '' === '9') {
    return 'NUEVE'
  }

  if (n + '' === '10') {
    return 'DIEZ'
  }
  if (n + '' === '11') {
    return 'ONCE'
  }
  if (n + '' === '12') {
    return 'DOCE'
  }
  if (n + '' === '13') {
    return 'TRECE'
  }
  if (n + '' === '14') {
    return 'CATORCE'
  }
  if (n + '' === '15') {
    return 'QUINCE'
  }
  if (n + '' === '16') {
    return 'DIECISEIS'
  }
  if (n + '' === '17') {
    return 'DIECISIETE'
  }
  if (n + '' === '18') {
    return 'DIECIOCHO'
  }
  if (n + '' === '19') {
    return 'DIECINUEVE'
  }

  return ''
}

export function decenasNal (n) {
  if (n + '' === '1') {
    return 'DIEZ'
  }
  if (n + '' === '2') {
    return 'VEINTE'
  }
  if (n + '' === '3') {
    return 'TREINTA'
  }
  if (n + '' === '4') {
    return 'CUARENTA'
  }
  if (n + '' === '5') {
    return 'CINCUENTA'
  }
  if (n + '' === '6') {
    return 'SESENTA'
  }
  if (n + '' === '7') {
    return 'SETENTA'
  }
  if (n + '' === '8') {
    return 'OCHENTA'
  }
  if (n + '' === '9') {
    return 'NOVENTA'
  }

  return ''
}

export function centenasNal (n) {
  if (n + '' === '1') {
    return 'CIENTO'
  }
  if (n + '' === '2') {
    return 'DOCIENTOS'
  }
  if (n + '' === '3') {
    return 'TRECIENTOS'
  }
  if (n + '' === '4') {
    return 'CUATROCIENTOS'
  }
  if (n + '' === '5') {
    return 'QUINIENTOS'
  }
  if (n + '' === '6') {
    return 'SEISCIENTOS'
  }
  if (n + '' === '7') {
    return 'SETECIENTOS'
  }
  if (n + '' === '8') {
    return 'OCHOCIENTOS'
  }
  if (n + '' === '9') {
    return 'NOVECIENTOS'
  }

  return ''
}

export default numberToText
