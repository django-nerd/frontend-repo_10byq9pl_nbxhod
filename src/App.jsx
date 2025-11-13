import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function ContactForm(){
  const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [form, setForm] = useState({name:'', email:'', phone:'', message:''})
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e)=>{
    e.preventDefault()
    setLoading(true)
    try{
      const res = await fetch(`${base}/api/contact`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)})
      if(!res.ok) throw new Error('Errore invio messaggio')
      setSent(true)
      setForm({name:'', email:'', phone:'', message:''})
    }catch(err){
      alert(err.message)
    }finally{
      setLoading(false)
    }
  }

  if(sent) return <div className="p-4 bg-green-50 border border-green-200 rounded">Grazie! Ti risponderemo al più presto.</div>

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Nome" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input className="border rounded px-3 py-2" placeholder="Email" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
      </div>
      <input className="border rounded px-3 py-2 w-full" placeholder="Telefono (opzionale)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
      <textarea className="border rounded px-3 py-2 w-full h-28" placeholder="Messaggio" required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} />
      <button disabled={loading} className="bg-blue-600 text-white rounded px-4 py-2 font-semibold">{loading?'Invio...':'Invia'}</button>
    </form>
  )
}

function Hero(){
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Stampa 3D professionale su misura</h1>
            <p className="mt-4 text-gray-600">Prototipazione rapida, piccole produzioni e modelli personalizzati in PLA, PETG, ABS e resina. Tempi rapidi e qualità garantita.</p>
            <div className="mt-6 flex gap-3">
              <a href="#contatti" className="bg-blue-600 text-white px-5 py-3 rounded-md font-semibold">Richiedi un preventivo</a>
              <Link to="/admin" className="px-5 py-3 rounded-md font-semibold border">Pannello</Link>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <img src="https://images.unsplash.com/photo-1705475025559-ad8efdedc74f?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHwzRCUyMHByaW50ZXJ8ZW58MHwwfHx8MTc2MzAzNzE2N3ww&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="3D printer" className="rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

function SocialBar(){
  const [links, setLinks] = useState([])
  useEffect(()=>{
    const load = async ()=>{
      try{
        const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
        const res = await fetch(`${base}/api/socials`)
        const data = await res.json()
        setLinks(Array.isArray(data)?data:[])
      }catch{}
    }
    load()
  },[])
  if(!links.length) return null
  return (
    <div className="bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-4 text-gray-100 text-sm">
        <span className="opacity-70">Seguici:</span>
        {links.map((l,i)=>(<a key={i} className="underline" href={l.url} target="_blank" rel="noreferrer">{l.platform}</a>))}
      </div>
    </div>
  )
}

function Products(){
  const [items, setItems] = useState([])
  useEffect(()=>{
    const load=async()=>{
      try{
        const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
        const res = await fetch(`${base}/api/products`)
        const data = await res.json()
        setItems(Array.isArray(data)?data:[])
      }catch{}
    }
    load()
  },[])
  return (
    <section id="prodotti" className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Vetrina prodotti e stampanti</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p,i)=> (
            <div key={i} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col">
              {p.image_url && <img src={p.image_url} alt={p.name} className="h-48 w-full object-cover rounded-lg mb-3"/>}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
              <div className="mt-3 flex-1" />
              <div className="mt-3 flex items-center justify-between">
                <div className="text-blue-600 font-semibold">{p.price?`€ ${Number(p.price).toFixed(2)}`:'Su richiesta'}</div>
                <div className="text-xs text-gray-500">{p.tags?.slice(0,3).join(' • ')}</div>
              </div>
            </div>
          ))}
          {items.length===0 && (
            <div className="col-span-full text-center text-gray-500">Nessun prodotto disponibile al momento.</div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function App(){
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SocialBar/>
      <Hero/>

      <Products/>

      <section id="contatti" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-bold mb-4">Contattaci</h2>
            <p className="text-gray-600 mb-6">Raccontaci il tuo progetto: materiale, dimensioni, quantità e tempistiche. Ti rispondiamo entro 24 ore.</p>
            <ContactForm/>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-2">Perché scegliere noi</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
              <li>Consulenza sui materiali e ottimizzazione file</li>
              <li>Prototipazione rapida e piccole produzioni</li>
              <li>Controllo qualità su ogni pezzo</li>
              <li>Consegna in tutta Italia</li>
            </ul>
            <div className="mt-6 text-sm text-gray-600">
              Oppure scrivici a <a className="text-blue-600 underline" href="mailto:info@tuaazienda.it">info@tuaazienda.it</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-6 border-t">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          <div>© {new Date().getFullYear()} Servizio Stampa 3D</div>
          <div className="flex gap-4">
            <a href="#prodotti" className="underline">Prodotti</a>
            <a href="#contatti" className="underline">Contatti</a>
            <Link to="/admin" className="underline">Pannello</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
