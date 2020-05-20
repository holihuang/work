import { renderRoutes } from 'react-router-config'
import { hot } from 'react-hot-loader'

import routes from './routes'

const Main = () => renderRoutes(routes)

export default hot(module)(Main)
