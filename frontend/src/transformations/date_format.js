
import moment from 'moment'

const date_format = (value, params, locale = 'es') => {
  return moment(value).locale(locale).format(params.input || 'DD-MM-YY')
}

export default date_format
