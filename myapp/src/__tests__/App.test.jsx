import { renderToString } from 'react-dom/server'
import App from '../App.jsx'

test('renders the UI library heading', () => {
  const html = renderToString(<App />)
  expect(html).toMatch(/Sai Scientifics UI Library/i)
})
