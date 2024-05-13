import { MongoClient, Db, Collection, ModifyResult } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    console.warn(`process.env.NODE_ENV === "${process.env.NODE_ENV}"`)
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export function dbPromise(): Promise<Db> {
    return new Promise<Db>(function(resolve, reject) {
        // console.log('dbPromise - vor clientPromise.then')
        clientPromise.then((client) => {
            try {
                // console.log('vor client.db')
                const theDb = client.db('pr-poker')
                // console.log('nach client.db')
            } catch (e) {
                console.error('exception in db pr-poker', e)
            }
            resolve(client.db("pr-poker"));
        }).catch((e) => {
            reject(e);
        })
    })
}

export async function awaitDb() {
    return await dbPromise()
}
