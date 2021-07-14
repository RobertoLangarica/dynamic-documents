import numeral from 'numeral'

// const isValidNumber = (v) => {
//   return isNumberString(v) || isNumber(v)
// }

// const getNumber = (v) => {
//   if (isNumberString(v)) {
//     return parseFloat(v)
//   }
//   return v
// }

const format_number = (value, params) => {
  return numeral(value).format(params.input || '0,0')
}

export default format_number
