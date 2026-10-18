// Using native fetch in Node 18+

const API_BASE = 'https://api.guardianpubs.com/api';

async function test() {
  try {
    const res = await fetch(`${API_BASE}/product/get-all/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter: null, select: 'slug updatedAt', pagination: null })
    });
    const data = await res.json();
    console.log('Full Product Data:', JSON.stringify(data).slice(0, 500));
    console.log('Product Success:', data.success);
    console.log('Product Count:', data.data ? data.data.length : 'null');
    
    const resA = await fetch(`${API_BASE}/author/get-all/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter: null, select: 'slug updatedAt', pagination: null })
    });
    const dataA = await resA.json();
    console.log('Author Success:', dataA.success);
    console.log('Author Count:', dataA.data ? dataA.data.length : 'null');

    const resAct = await fetch(`${API_BASE}/activities/get-all/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter: null, select: { slug: 1, updatedAt: 1 }, pagination: null })
    });
    const dataAct = await resAct.json();
    console.log('Activity Success:', dataAct.success);
    console.log('Activity Count:', dataAct.data ? dataAct.data.length : 'null');

    const resPkg = await fetch(`${API_BASE}/special-package/get-all/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter: null, select: { slug: 1, updatedAt: 1 }, pagination: null })
    });
    const dataPkg = await resPkg.json();
    console.log('Package Success:', dataPkg.success);
    console.log('Package Count:', dataPkg.data ? dataPkg.data.length : 'null');

    const resB = await fetch(`${API_BASE}/blog/get-all/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter: null, select: 'slug updatedAt', pagination: null })
    });
    const dataB = await resB.json();
    console.log('Blog Success:', dataB.success);
    console.log('Blog Count:', dataB.data ? dataB.data.length : 'null');

  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
