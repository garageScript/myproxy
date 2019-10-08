import { startAppServer } from '../../server/server'
import fetch from 'node-fetch'
import uuidv4 from 'uuid/v4' 

const TEST_PORT = process.env.PORT || 3312 
const ADMIN = process.env.ADMIN || 'hello'
const apiURL = `http://127.0.0.1:${TEST_PORT}`

describe('/api', () =>{
  let server 

  beforeAll(async ()=>{
    server = await startAppServer(TEST_PORT, ADMIN)
  })

  afterAll(()=>{
    server.close()
  })

  it('checks mappings for newly added mapping', async()=>{
    const subDomain = `testing${uuidv4()}`
    const domain = 'Rahul'
    const port = '5678'
    await fetch(`${apiURL}/api/mappings`, {
      method: 'POST', 
      headers: {
        authorization: ADMIN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain,
        subDomain,
        port,

      })
    }).then(r => r.json()).then((data)=>{
      expect(data.port).toEqual(port)
      expect(data.subDomain).toEqual(subDomain)
      expect(data.domain).toEqual(domain)
      expect(data.fullDomain).toEqual(`${subDomain}.${domain}`)
    })
  })

  it('Delete mapping', async()=>{
    const subDomain = `delete${uuidv4()}`
    const domain = 'albertow'
    const port = '4500'
    await fetch(`${apiURL}/api/mappings`, {
      method: 'POST', 
      headers: {
        authorization: ADMIN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain,
        subDomain,
        port,

      })
    }).then(r => r.json()).then((data)=>{
      expect(data.port).toEqual(port)
      expect(data.subDomain).toEqual(subDomain)
      expect(data.domain).toEqual(domain)
      expect(data.fullDomain).toEqual(`${subDomain}.${domain}`)
      return data
      }).then(async (data)=>{
        await fetch(`${apiURL}/api/mappings/delete/${data.id}`, {
        method: 'DELETE', 
        headers: {
        authorization: ADMIN,
        'Content-Type': 'application/json'
        }
      }).then(r=>r.json()).then((del)=>{
        expect(del.id).toEqual(data.id)
      })
      })  
  })
})
