const API_BASE = '/api';

let selectedToppings = [];
let currentEventId = null;
let viewcounter = 0;
let newpizzastate =0;

const iconMap = {
  salami: '🍖',
  käse: '🧀',
  cheese: '🧀',
  pilze: '🍄',
  mushroom: '🍄'
};




document.addEventListener('DOMContentLoaded', () => {
  loadPage();
});


async function login() {
    const eventpw = document.getElementById('eventligincode').value;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    if (eventpw == "sherm"){
        viewcounter = 1;
        localStorage.setItem('logedin', '1');
        loadPage();
    }
    else{
        viewcounter=3
        loadPage();
       
        
  };

};
function counternull(){
    viewcounter=0;
};

function newpizza(){
  newpizzastate = 1;
  viewcounter=1;
  loadPage();
};

function backpizza(){
  viewcounter=2;
  loadPage();
};

async function loadPage() {
 console.log(viewcounter);
  const res = await fetch(`${API_BASE}/events/active-with-toppings`);
  const data = await res.json();
  currentEventId = data.event.id;
   const orders = JSON.parse(localStorage.getItem(`orders_event_${currentEventId}`) || '[]');
   const loginstate = JSON.parse(localStorage.getItem(`logedin`));
   if (loginstate == 1 && viewcounter==0){
    viewcounter =1;
   };

  if (orders && orders.length > 0 && newpizzastate === 0) {
      viewcounter = 2;
  }
 

  console.log(viewcounter);
  document.querySelectorAll('.view').forEach(v => {
  v.classList.remove('active');
    });

if(viewcounter == 0){
  document.getElementById('view1').classList.add('active');
};
if(viewcounter==1){
  document.getElementById('view2').classList.add('active');
};
if(viewcounter==2){

    document.getElementById('view3').classList.add('active');
};
if(viewcounter==3){
   document.getElementById('view-wrong').classList.add('active');
};


if(orders && orders.length > 0){
  document.getElementById('backbuttonorders').classList.add('active');
};


// Ab hier Toppingsauswahl:

const container = document.getElementById('toppingsContainer');
container.innerHTML = '';

for (const topping of data.toppings) {
  const card = document.createElement('div');
  card.className = 'topping-card';

  // 🍕 Icon (einfach erstmal statisch oder je nach topping später fancy)
  const icon = document.createElement('div');
  icon.className = 'topping-icon';
  icon.innerText = '🍕';

  const name = document.createElement('div');
  name.className = 'topping-name';
  name.innerText = topping.name;

  // hidden checkbox (für state)
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = topping.id;
  checkbox.style.display = 'none';

  // klick auf ganze card
  card.onclick = () => {
    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
      selectedToppings.push(topping.id);
      card.classList.add('selected');
    } else {
      selectedToppings = selectedToppings.filter(id => id !== topping.id);
      card.classList.remove('selected');
    }
  };
  const check = document.createElement('div');
  check.className = 'topping-check';
  check.innerText = '✔';
  card.appendChild(check);


  icon.innerText = iconMap[topping.name.toLowerCase()] || '🍕';
  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(checkbox);

  container.appendChild(card);
}







 showOrders();

}

async function submitOrder() {
  const note = document.getElementById('orderNote').value.trim();
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      eventId: currentEventId,
      toppings: selectedToppings,
      note: note
    })
  });

  const data = await res.json();

  saveOrder(data.orderNumber);
  viewcounter=2;
  newpizzastate = 0;
  loadPage();
}




function saveOrder(orderNumber) {
  let orders = JSON.parse(localStorage.getItem(`orders_event_${currentEventId}`) || '[]');
  orders.push(orderNumber);

  localStorage.setItem(`orders_event_${currentEventId}`, JSON.stringify(orders
  ));

  cleanupOldEvents(currentEventId);
}


function cleanupOldEvents(currentEventId) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key.startsWith('orders_event_') && !key.endsWith(currentEventId)) {
      localStorage.removeItem(key);
    }
  }
}

async function showOrders() {
  const orders = JSON.parse(
    localStorage.getItem(`orders_event_${currentEventId}`) || '[]'
  );

  const container = document.getElementById('orderInfo');

  if (orders.length === 0) {
    container.innerHTML = '';
    return;
  }

  try {
    const res = await fetch(
      `/api/orders/by-ids?ids=${orders.join(',')}`
    );

    const data = await res.json();
    container.innerHTML = '';

    for (const order of data) {
      let status = '';

      // 🍕 toppings anzeigen
      const toppingsText = order.toppings.length > 0
        ? `(${order.toppings.join(', ')})`
        : '(plain sad pizza 😢)';
      const noteText = order.note ? `📝 "${order.note}"` : '';

const card = document.createElement('div');
card.className = 'order-card';

card.innerHTML = `
  <div class="order-header">
    <span class="order-id">🍕 Pizza ${order.id}</span>
    <span class="order-status ${getStatusClass(order)}">
      ${getStatusText(order)}
    </span>
  </div>

  <div class="order-body">
    <div class="order-section">
      <strong>Toppings:</strong>
      <span>${toppingsText || 'keine 😢'}</span>
    </div>

    <div class="order-section">
      <strong>Wunsch:</strong>
      <span>${order.note || '—'}</span>
    </div>
  </div>
`;

container.appendChild(card);
    }

  } catch (err) {
    console.error(err);
    container.innerText = 'Fehler beim Laden 🍕💥';
  }
}

function getStatusText(order) {
  if (!order.validated) return '⏳ Wartet auf Bestätigung';
  if (!order.fertig) return '👨‍🍳 In Zubereitung';
  return '✅ Fertig!';
}

function getStatusClass(order) {
  if (!order.validated) return 'status-waiting';
  if (!order.fertig) return 'status-cooking';
  return 'status-ready';
}

loadPage();

setInterval(showOrders, 3000);



