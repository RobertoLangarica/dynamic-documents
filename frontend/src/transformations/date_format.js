
import moment from 'moment'

const date_format = (value, params) => {
  return moment(value).format(params.input || 'DD-MM-YY')
}

export default date_format
