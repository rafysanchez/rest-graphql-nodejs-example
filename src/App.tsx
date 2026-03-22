import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, Zap, Globe, Database, ArrowRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface User {
  id: string;
  name: string;
  email: string;
  orders?: Order[];
}

interface Order {
  id: string;
  status: string;
  totalValue: number;
}

export default function App() {
  const [view, setView] = useState<'rest' | 'graphql'>('rest');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [logs, setLogs] = useState<{ type: string; url: string; time: number }[]>([]);
  const [stats, setStats] = useState({ requests: 0, totalTime: 0 });

  const addLog = (type: string, url: string, time: number) => {
    setLogs(prev => [{ type, url, time }, ...prev].slice(0, 10));
  };

  const fetchRest = async () => {
    setLoading(true);
    setData([]);
    setLogs([]);
    const start = performance.now();
    let requestCount = 0;

    try {
      // 1. Fetch Users
      const usersRes = await fetch('/api/users');
      requestCount++;
      addLog('GET', '/api/users', Math.round(performance.now() - start));
      
      if (!usersRes.ok) {
        const text = await usersRes.text();
        throw new Error(`REST Error (Users): ${usersRes.status} - ${text.slice(0, 100)}`);
      }
      
      const users: User[] = await usersRes.json();

      // 2. For each user, fetch their orders (Simulating N+1 on client side)
      const usersWithOrders = await Promise.all(
        users.map(async (user) => {
          const orderStart = performance.now();
          const ordersRes = await fetch(`/api/orders`); // Simplified for demo
          requestCount++;
          
          if (!ordersRes.ok) {
            const text = await ordersRes.text();
            addLog('ERR', `/api/orders`, Math.round(performance.now() - orderStart));
            return { ...user, orders: [] };
          }
          
          const allOrders: Order[] = await ordersRes.json();
          const userOrders = allOrders.filter(o => (o as any).userId === user.id);
          addLog('GET', `/api/orders?userId=${user.id}`, Math.round(performance.now() - orderStart));
          return { ...user, orders: userOrders };
        })
      );

      setData(usersWithOrders);
      setStats({ requests: requestCount, totalTime: Math.round(performance.now() - start) });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchGraphQL = async () => {
    setLoading(true);
    setData([]);
    setLogs([]);
    const start = performance.now();

    const query = `
      query GetUsersWithOrders {
        users {
          id
          name
          email
          orders {
            id
            status
            totalValue
          }
        }
      }
    `;

    try {
      const res = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      addLog('POST', '/graphql', Math.round(performance.now() - start));
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GraphQL Error: ${res.status} - ${text.slice(0, 100)}`);
      }
      
      const result = await res.json();
      
      if (result.errors) {
        throw new Error(`GraphQL Query Error: ${result.errors[0].message}`);
      }
      
      setData(result.data.users);
      setStats({ requests: 1, totalTime: Math.round(performance.now() - start) });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        // Auto fetch after seed
        view === 'rest' ? fetchRest() : fetchGraphQL();
      } else {
        alert('Error seeding data: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server for seeding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="text-black fill-current" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">API Comparison</h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Clean Architecture Demo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setView('rest')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${view === 'rest' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                REST API
              </button>
              <button 
                onClick={() => setView('graphql')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${view === 'graphql' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                GraphQL
              </button>
            </div>

            <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

            <div className="flex gap-2">
              <a 
                href="/api/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Globe size={14} className="text-blue-400" />
                Swagger
              </a>
              <a 
                href="/graphiql" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Database size={14} className="text-pink-400" />
                GraphiQL
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          
          {/* Main Content */}
          <div className="space-y-8">
            <section className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {view === 'rest' ? <Globe className="text-blue-400" /> : <Database className="text-pink-400" />}
                    {view === 'rest' ? 'RESTful Endpoints' : 'GraphQL Query'}
                  </h2>
                  <p className="text-zinc-400 max-w-xl">
                    {view === 'rest' 
                      ? 'Standard architectural style using multiple endpoints for different resources. Often leads to over-fetching or multiple round-trips.' 
                      : 'A query language for APIs that allows clients to request exactly what they need in a single request.'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={seedData}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl text-sm transition-colors"
                  >
                    Seed Data
                  </button>
                  <button 
                    onClick={view === 'rest' ? fetchRest : fetchGraphQL}
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? 'Fetching...' : 'Fetch Data'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Requests</p>
                  <p className="text-2xl font-mono text-emerald-400">{stats.requests}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Total Time</p>
                  <p className="text-2xl font-mono text-blue-400">{stats.totalTime}ms</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Efficiency</p>
                  <p className="text-2xl font-mono text-pink-400">{view === 'graphql' ? 'High' : 'Standard'}</p>
                </div>
              </div>

              {/* Data Display */}
              <div className="space-y-4">
                {data.length === 0 && !loading && (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-zinc-600">
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p>No data fetched yet. Click "Fetch Data" to start.</p>
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {data.map((user) => (
                    <motion.div 
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-800/30 border border-white/5 p-6 rounded-2xl hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                            <Users size={18} className="text-zinc-400" />
                          </div>
                          <div>
                            <h3 className="font-bold">{user.name}</h3>
                            <p className="text-xs text-zinc-500">{user.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-zinc-900 px-2 py-1 rounded border border-white/10 text-zinc-500 font-mono">
                          ID: {user.id.slice(0, 8)}...
                        </span>
                      </div>

                      <div className="pl-12 space-y-2">
                        {user.orders?.map(order => (
                          <div key={order.id} className="flex items-center gap-3 text-sm text-zinc-400 bg-black/20 p-2 rounded-lg">
                            <ShoppingCart size={14} className="text-emerald-500" />
                            <span>Order #{order.id.slice(0, 4)}</span>
                            <span className="ml-auto font-mono text-emerald-400">${order.totalValue}</span>
                            <span className="text-[10px] uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                              {order.status}
                            </span>
                          </div>
                        ))}
                        {(!user.orders || user.orders.length === 0) && (
                          <p className="text-xs text-zinc-600 italic">No orders found for this user.</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* Sidebar: Network Logs */}
          <aside className="space-y-6">
            <div className="bg-zinc-900/80 border border-white/5 rounded-3xl p-6 h-fit sticky top-32">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                <Activity size={16} />
                Network Waterfall
              </h3>
              
              <div className="space-y-3">
                {logs.length === 0 && (
                  <p className="text-xs text-zinc-600 text-center py-12">Logs will appear here...</p>
                )}
                {logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col gap-1 p-3 bg-black/40 rounded-xl border-l-2 border-emerald-500"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-500">{log.type}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{log.time}ms</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 truncate font-mono">{log.url}</p>
                  </motion.div>
                ))}
              </div>

              {logs.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-500">Total Overhead</span>
                    <span className="font-mono text-emerald-400">{stats.totalTime}ms</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: view === 'graphql' ? '20%' : '100%' }}
                      className={`h-full ${view === 'graphql' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-2">
                    {view === 'graphql' 
                      ? 'GraphQL minimizes latency by reducing the number of requests.' 
                      : 'REST may require multiple requests to resolve relationships.'}
                  </p>
                </div>
              )}
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
