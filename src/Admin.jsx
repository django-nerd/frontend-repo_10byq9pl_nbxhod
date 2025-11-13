import { useEffect, useState } from 'react'

function TextInput(props){
  const {label, ...rest} = props
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <input {...rest} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </label>
  )
}

function TextArea(props){
  const {label, ...rest} = props
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <textarea {...rest} className="w-full border rounded-md px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </label>
  )
}

export default function Admin(){
  const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [token, setToken] = useState(localStorage.getItem('adm_token')||'')
  const [login, setLogin] = useState({username:'admin', password:'admin123'})
  const [tab, setTab] = useState('products')

  const [products, setProducts] = useState([])
  const [contacts, setContacts] = useState([])
  const [socials, setSocials] = useState([])

  const [pForm, setPForm] = useState({name:'', description:'', price:'', image_url:'', available:true, tags:''})
  const [sForm, setSForm] = useState({platform:'Instagram', url:'', visible:true})

  useEffect(()=>{
    if(token){
      refreshAll()
    }
  },[token])

  const doLogin = async (e)=>{
    e.preventDefault()
    try{
      const res = await fetch(`${base}/api/admin/login`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(login)})
      if(!res.ok) throw new Error('Credenziali non valide')
      const data = await res.json()
      setToken(data.token)
      localStorage.setItem('adm_token', data.token)
    }catch(err){
      alert(err.message)
    }
  }

  const refreshAll = async ()=>{
    await Promise.all([
      fetch(`${base}/api/admin/products?token=${token}`).then(r=>r.json()).then(setProducts).catch(()=>setProducts([])),
      fetch(`${base}/api/admin/contacts?token=${token}`).then(r=>r.json()).then(setContacts).catch(()=>setContacts([])),
      fetch(`${base}/api/socials`).then(r=>r.json()).then(setSocials).catch(()=>setSocials([])),
    ])
  }

  const addProduct = async (e)=>{
    e.preventDefault()
    try{
      const payload = {
        name: pForm.name,
        description: pForm.description || undefined,
        price: pForm.price ? parseFloat(pForm.price) : undefined,
        image_url: pForm.image_url || undefined,
        specs: {},
        tags: pForm.tags ? pForm.tags.split(',').map(t=>t.trim()).filter(Boolean) : [],
        available: !!pForm.available
      }
      const res = await fetch(`${base}/api/admin/products?token=${token}`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
      if(!res.ok) throw new Error('Errore nel salvataggio prodotto')
      setPForm({name:'', description:'', price:'', image_url:'', available:true, tags:''})
      refreshAll()
    }catch(err){
      alert(err.message)
    }
  }

  const addSocial = async (e)=>{
    e.preventDefault()
    try{
      const payload = { platform: sForm.platform, url: sForm.url, visible: !!sForm.visible }
      const res = await fetch(`${base}/api/admin/socials?token=${token}`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
      if(!res.ok) throw new Error('Errore nel salvataggio link social')
      setSForm({platform:'Instagram', url:'', visible:true})
      refreshAll()
    }catch(err){
      alert(err.message)
    }
  }

  if(!token){
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Pannello di Controllo</h1>
          <p className="text-gray-600 mb-4">Accedi per gestire prodotti, contatti e social.</p>
          <form onSubmit={doLogin}>
            <TextInput label="Username" value={login.username} onChange={e=>setLogin({...login, username:e.target.value})} />
            <TextInput label="Password" type="password" value={login.password} onChange={e=>setLogin({...login, password:e.target.value})} />
            <button className="w-full bg-blue-600 text-white rounded-md py-2 font-semibold">Accedi</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Pannello di Controllo</h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>setTab('products')} className={`px-3 py-1 rounded ${tab==='products'?'bg-blue-600 text-white':'bg-gray-100'}`}>Prodotti</button>
            <button onClick={()=>setTab('contacts')} className={`px-3 py-1 rounded ${tab==='contacts'?'bg-blue-600 text-white':'bg-gray-100'}`}>Contatti</button>
            <button onClick={()=>setTab('socials')} className={`px-3 py-1 rounded ${tab==='socials'?'bg-blue-600 text-white':'bg-gray-100'}`}>Social</button>
            <button onClick={()=>{localStorage.removeItem('adm_token'); setToken('')}} className="ml-4 px-3 py-1 rounded bg-red-500 text-white">Esci</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab==='products' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold mb-4">Aggiungi prodotto</h2>
              <form onSubmit={addProduct}>
                <TextInput label="Nome" value={pForm.name} onChange={e=>setPForm({...pForm, name: e.target.value})} required />
                <TextArea label="Descrizione" value={pForm.description} onChange={e=>setPForm({...pForm, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput label="Prezzo (€)" type="number" step="0.01" value={pForm.price} onChange={e=>setPForm({...pForm, price: e.target.value})} />
                  <TextInput label="Immagine URL" value={pForm.image_url} onChange={e=>setPForm({...pForm, image_url: e.target.value})} />
                </div>
                <TextInput label="Tag (separati da virgola)" value={pForm.tags} onChange={e=>setPForm({...pForm, tags: e.target.value})} />
                <label className="flex items-center gap-2 mb-4"><input type="checkbox" checked={pForm.available} onChange={e=>setPForm({...pForm, available: e.target.checked})} /> Disponibile</label>
                <button className="bg-blue-600 text-white rounded-md px-4 py-2 font-semibold">Salva</button>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold mb-4">Prodotti</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map((p, i)=> (
                  <div key={i} className="border rounded-lg p-3">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="h-36 w-full object-cover rounded mb-2" />}
                    <div className="font-semibold">{p.name}</div>
                    {p.price && <div className="text-blue-600">€ {Number(p.price).toFixed(2)}</div>}
                    {p.description && <div className="text-sm text-gray-600 mt-1 line-clamp-3">{p.description}</div>}
                  </div>
                ))}
                {products.length===0 && <p className="text-gray-500">Nessun prodotto.</p>}
              </div>
            </div>
          </div>
        )}

        {tab==='contacts' && (
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="text-lg font-semibold mb-4">Messaggi di contatto</h2>
            <div className="space-y-3">
              {contacts.map((c, i)=> (
                <div key={i} className="border rounded-lg p-3">
                  <div className="font-semibold">{c.name} • {c.email}{c.phone?` • ${c.phone}`:''}</div>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap mt-1">{c.message}</div>
                </div>
              ))}
              {contacts.length===0 && <p className="text-gray-500">Ancora nessun messaggio.</p>}
            </div>
          </div>
        )}

        {tab==='socials' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold mb-4">Aggiungi social</h2>
              <form onSubmit={addSocial}>
                <TextInput label="Piattaforma" value={sForm.platform} onChange={e=>setSForm({...sForm, platform: e.target.value})} />
                <TextInput label="URL" value={sForm.url} onChange={e=>setSForm({...sForm, url: e.target.value})} required />
                <label className="flex items-center gap-2 mb-4"><input type="checkbox" checked={sForm.visible} onChange={e=>setSForm({...sForm, visible: e.target.checked})} /> Visibile</label>
                <button className="bg-blue-600 text-white rounded-md px-4 py-2 font-semibold">Salva</button>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold mb-4">Social attivi</h2>
              <ul className="list-disc pl-5 space-y-2">
                {socials.map((s,i)=>(
                  <li key={i}><span className="font-medium">{s.platform}:</span> <a className="text-blue-600 underline" href={s.url} target="_blank" rel="noreferrer">{s.url}</a></li>
                ))}
                {socials.length===0 && <p className="text-gray-500">Nessun link social.</p>}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
