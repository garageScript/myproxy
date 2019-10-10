import { startAppServer } from '../../server/server'
import fetch from 'node-fetch'
import uuidv4 from 'uuid/v4'
import { mappingAdapter } from '../helpers/mappingAdapter'

const TEST_PORT = process.env.PORT || 50604
const ADMIN = process.env.ADMIN || 'hjhj'
const apiURL = `http://127.0.0.1:${TEST_PORT}`

describe('/api', () => {
  let server

  beforeAll(async () => {
    server = await startAppServer(TEST_PORT, ADMIN)
  })

  afterAll(() => {
    server.close()
  })

  it('checks mappings for newly added mapping', async () => {
    const subDomain = `testing${uuidv4()}`
    const domain = 'Rahul'
    const port = '5678'
    await fetch(`${apiURL}/api/mappings`, {
      method: 'POST',
      headers: {
        authorization: ADMIN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        subDomain,
        port,
      }),
    })
      .then(r => r.json())
      .then(data => {
        expect(data.port).toEqual(port)
        expect(data.subDomain).toEqual(subDomain)
        expect(data.domain).toEqual(domain)
        expect(data.fullDomain).toEqual(`${subDomain}.${domain}`)
      })
  })

  it('Delete mapping', async () => {
    const subDomain = `delete${uuidv4()}`
    const domain = 'albertow'
    const port = '4500'
    const createMapping = await mappingAdapter('/', 'POST', {
      domain,
      subDomain,
      port,
    })
    expect(createMapping.status).toEqual(200)
    const mapping = await createMapping.json()
    const delMapping = await mappingAdapter(`/delete/${mapping.id}`, 'DELETE')
    expect(delMapping.status).toEqual(200)
    const deletedMapping = await delMapping.json()
    expect(deletedMapping.port).toEqual(port)
    expect(deletedMapping.subDomain).toEqual(subDomain)
    expect(deletedMapping.domain).toEqual(domain)
    expect(deletedMapping.fullDomain).toEqual(`${subDomain}.${domain}`)
    expect(deletedMapping.id).toEqual(mapping.id)
    const getMapping = await mappingAdapter(`/${mapping.id}`, 'GET')
    expect(getMapping.status).toEqual(200)
    const checkDeletion = await getMapping.json()
    expect(checkDeletion.checkDomain).toEqual(undefined)
  })

  it('checks no duplicate subdomain is created for same domain', async () => {
    const subDomain = `testing${uuidv4()}`
    const domain = 'Sahil'
    const port = '3522'
    await fetch(`${apiURL}/api/mappings`, {
      method: 'POST',
      headers: {
        authorization: ADMIN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        subDomain,
        port,
      }),
    })
    const response = await fetch(`${apiURL}/api/mappings`, {
      method: 'POST',
      headers: {
        authorization: ADMIN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        subDomain,
        port,
      }),
    })
    expect(response.status).toEqual(400)
  })
})
