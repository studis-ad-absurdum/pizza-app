//const { get } = require("../../src/routes/orders");

const API_BASE = '/api'; // wichtig: gleiche Domain

let token = null;
let currentEventId = null;
let toppings = [];
let activeEventid = null;




async function getactiveEventid() {
    const res = await fetch(`${API_BASE}/events`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
        },
  });
  const data = await res.json();

  const activeEvent = data.find(e => e.is_active === true);

if (activeEvent) {
  activeEventid = activeEvent.id;
}
if (!activeEvent) {
  console.error('Kein aktives Event gefunden 😢');
}
  console.log(activeEventid);
};

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  token = data.token;

  document.getElementById('loginCard').style.display = 'none';
  document.getElementById('topbar1').style.display ='block';
  document.getElementById('order-view').classList.add('active');

  getactiveEventid();
}

async function createEventHandler() {
  const name = document.getElementById('eventName').value; 
  const password = document.getElementById('eventPassword').value;


  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      name: name,
      password: password
    })
  });
  
  const data = await res.json();
  currentEventId = data.id;

  document.getElementById('eventIdDisplay').innerText = 'Event ID: ' + data.id;
  document.getElementById('toppingCard').style.display = 'block';
}

function addTopping() {
  const input = document.getElementById('toppingInput');
  const value = input.value;

  if (!value) return;

  toppings.push(value);

  const li = document.createElement('li');
  li.innerText = value;
  document.getElementById('toppingList').appendChild(li);

  input.value = '';
}

async function saveToppings() {
  await fetch(`${API_BASE}/events/${currentEventId}/toppings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ toppings })
  });

  alert('Toppings gespeichert 🍕');
}

async function listEvents() {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    
  });
  const data = await res.json();
  //console.log(data)
  const list = document.getElementById('eventlist');
  list.innerHTML = ''; // reset

for (const event of data) {
  const li = document.createElement('li');

  const text = document.createElement('span');
  text.innerText = `${event.id} - ${event.name}`;

  const button = document.createElement('button');
  button.innerText = 'Edit Event Name';
  button.className = "button2";
  button.onclick = (e) => {
    e.stopPropagation(); // 🔥 verhindert Click auf LI
    editEvent(li, event);
  };
  const activateBtn = document.createElement('button');
  if (event.is_active) {
    activateBtn.disabled = true;
  }
  activateBtn.innerText = event.is_active ? 'Active ✅' : 'Activate';
  activateBtn.className = "button2";

  activateBtn.onclick = async (e) => {
    e.stopPropagation();

    await fetch(`${API_BASE}/events/${event.id}/activate`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    listEvents(); // 🔄 neu laden
    getactiveEventid();
  };

  //  CLICK AUF DAS GANZE LI
  li.onclick = () => {
    selectEvent(li, event);
  };

  li.appendChild(text);
  li.appendChild(button);
  li.appendChild(activateBtn);
  if (event.is_active) {
    li.classList.add('active2');
  }


  list.appendChild(li);
}

}

async function editEvent(li, event) {
  li.innerHTML = event.name; // Inhalt löschen

const input = document.createElement('input');
  input.value = event.name;

  const saveBtn = document.createElement('button');
  saveBtn.className = "button2";
  saveBtn.innerText = 'Save';
  saveBtn.onclick = () => editEventName(event.id, input.value);

  const backbttn = document.createElement('button');
  backbttn.innerText = 'Back';
  backbttn.className = 'button2';

  backbttn.onclick = () => {
    li.innerHTML = '';

    const text = document.createElement('span');
    text.innerText = `${event.id} - ${event.name}`;

    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit Event Name';
    editBtn.className = 'button2';
    editBtn.onclick = () => editEvent(li, event);

    li.appendChild(text);
    li.appendChild(editBtn);
  };

  li.appendChild(input);
  li.appendChild(saveBtn);
  li.appendChild(backbttn);
}

async function editEventName(id, newName) {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ name: newName })
  });

  const data = await res.json();
  console.log('Updated:', data);
}

function selectEvent(li, event) {
  currentEventId = event.id;

  // alle anderen entfernen
  document.querySelectorAll('#eventlist li').forEach(el => {
    el.classList.remove('active');
  });

  // dieses markieren
  li.classList.add('active');

  console.log('Selected event:', event);
  loadToppings(event.id);
}


async function loadToppings(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/toppings`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  document.getElementById('toppingsCard').style.display = 'block';
  const data = await res.json();

  const list = document.getElementById('toppingsList');
  list.innerHTML = '';

  for (const topping of data) {
    const li = document.createElement('li');

    const text = document.createElement('span');
    text.innerText = topping.name;

    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.className = 'button2';
    editBtn.onclick = () => editTopping(li, topping);

    const delBtn = document.createElement('button');
    delBtn.innerText = 'Delete';
    delBtn.className = 'button2';
    delBtn.onclick = () => deleteTopping(topping.id);

    li.appendChild(text);
    li.appendChild(editBtn);
    li.appendChild(delBtn);

    list.appendChild(li);
  }

  renderAddTopping();
}

function editTopping(li, topping) {
  li.innerHTML = '';

  const input = document.createElement('input');
  input.value = topping.name;

  const save = document.createElement('button');
  save.innerText = 'Save';
  save.className = 'button2';
  save.onclick = async () => {
    await fetch(`${API_BASE}/toppings/${topping.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ name: input.value })
    });

    loadToppings(currentEventId);
  };

  li.appendChild(input);
  li.appendChild(save);
}

async function deleteTopping(id) {
  await fetch(`${API_BASE}/toppings/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });

  loadToppings(currentEventId);
}

function renderAddTopping() {
  const list = document.getElementById('toppingsList');

  const li = document.createElement('li');

  const input = document.createElement('input');
  input.placeholder = 'New topping...';

  const addBtn = document.createElement('button');
  addBtn.innerText = '+';
  addBtn.className = 'button2';

  addBtn.onclick = async () => {
    await fetch(`${API_BASE}/events/${currentEventId}/topping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ name: input.value })
    });

    loadToppings(currentEventId);
  };

  li.appendChild(input);
  li.appendChild(addBtn);

  list.appendChild(li);
}
function setActiveButton(btn) {
  document.querySelectorAll('.nav-buttons button')
    .forEach(b => b.classList.remove('active'));

  btn.classList.add('active');
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
  });

  document.getElementById(viewId).classList.add('active');
  if (viewId == 'view-events') listEvents();
  if (viewId == 'pickup-view') loadPickupOrders();

}


async function loadUnvalidatedOrders() {
  const list = document.getElementById('orderlist');
  list.innerHTML = '';
  console.log(activeEventid);
  const res = await fetch(`/api/orders/unvalidated/${activeEventid}`);
  const orders = await res.json();

  for (const order of orders) {
    const li = document.createElement('li');

    // Text
    const text = document.createElement('span');
    const noteText = order.note ? `📝 "${order.note}"` : '';
    const toppingsText = order.toppings.length > 0
      ? `(${order.toppings.join(', ')})`
      : '';

    text.innerText = `🍕 Pizza ${order.id} ${toppingsText} ${noteText}`;


    // Button
    const btn = document.createElement('button');
    btn.innerText = 'Validieren';
    btn.className = 'button2';

    btn.onclick = async () => {
      await validateOrder(order.id);
      li.remove(); // direkt aus Liste entfernen
    };

    li.appendChild(text);
    li.appendChild(btn);

    list.appendChild(li);
  }
}

async function validateOrder(orderId) {
  await fetch(`/api/orders/${orderId}/validate`, {
    method: 'PATCH'
  });
};

async function loadKitchenOrders() {
  const list = document.getElementById('kitchenList');
  list.innerHTML = '';

  if (!activeEventid) return;

  const res = await fetch(`/api/orders/validated/${activeEventid}`);
  const orders = await res.json();
  console.log(orders);
  console.log(activeEventid,"Penis");

  for (const order of orders) {
    const li = document.createElement('li');

    const text = document.createElement('span');
// 🍕 toppings hübsch anzeigen
    const toppingsText = order.toppings.length > 0
      ? `(${order.toppings.join(', ')})`
      : '(plain sad pizza 😢)';
    const noteText = order.note
      ? `📝 "${order.note}"`
      : '';
    text.innerText=''
    text.innerText = `🍕 Pizza ${order.id} ${toppingsText} ${noteText} `;

    const btn = document.createElement('button');
    btn.innerText = 'Fertig';
    btn.className = 'button2';

    btn.onclick = async () => {
      await markAsReady(order.id);
      li.remove(); // direkt aus Liste entfernen
    };

    li.appendChild(text);
    li.appendChild(btn);

    list.appendChild(li);
  }
}

async function loadPickupOrders() {
  const list = document.getElementById('pickupList');
  list.innerHTML = '';

  if (!activeEventid) return;

  const res = await fetch(`/api/orders/fertig/${activeEventid}`);
  const orders = await res.json();

  for (const order of orders) {
    const li = document.createElement('li');

    const text = document.createElement('span');
    const toppingsText = order.toppings.length > 0
      ? `(${order.toppings.join(', ')})`
      : '(plain sad pizza 😢)';
    const noteText = order.note
      ? `📝 "${order.note}"`
      : '';
    text.innerText = `🍕 Pizza ${order.id} ${toppingsText} ${noteText} `;

    const btn = document.createElement('button');
    btn.innerText = 'Abgeholt';
    btn.className = 'button2';

    btn.onclick = async () => {
      await markAsPickedUp(order.id);
      li.remove(); // direkt aus Liste entfernen
    };

    li.appendChild(text);
    li.appendChild(btn);

    list.appendChild(li);
  }
}

async function markAsReady(orderId) {
  await fetch(`/api/orders/${orderId}/fertig`, {
    method: 'PATCH'
  });
}

async function markAsPickedUp(orderId) {
  await fetch(`/api/orders/${orderId}/abgeholt`, {
    method: 'PATCH'
  });
}



setInterval(loadKitchenOrders, 3000);
setInterval(loadUnvalidatedOrders, 5000);
setInterval(loadPickupOrders, 3000);
