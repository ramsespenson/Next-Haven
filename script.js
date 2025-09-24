// --- Data for products ---
const products = [
    {
        id: 1,
        name: 'Modern Sofa',
        brand: 'West Elm',
        condition: 'Like New',
        description: 'Comfortable 3-seater, soft gray fabric, gently used.',
        longDesc: 'Brand: West Elm | Condition: Like New | Description: This modern sofa combines comfort and style, perfect for student apartments or small living rooms. Soft gray fabric is durable and easy to clean, with supportive cushions and a sturdy frame.',
        price: '$120',
        priceValue: 120,
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 2,
        name: 'Wooden Bookshelf',
        brand: 'Target',
        condition: 'Good',
        description: 'Tall, 5 shelves, walnut finish. Great for textbooks or decor.',
        longDesc: 'Brand: Target | Condition: Good | Description: A tall, slim bookshelf with five spacious shelves and a classic walnut finish. Holds books, plants, and decor items. Some minor scuffs from previous use.',
        price: '$45',
        priceValue: 45,
        image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 3,
        name: 'Study Desk',
        brand: 'Ikea',
        condition: 'Like New',
        description: 'Minimalist desk, spacious top, includes cable management.',
        longDesc: 'Brand: Ikea | Condition: Like New | Description: This minimalist study desk is perfect for work or study. Spacious tabletop with built-in cable management. No marks or wear, looks almost new.',
        price: '$65',
        priceValue: 65,
        image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 4,
        name: 'Ergo Desk Chair',
        brand: 'Staples',
        condition: 'Good',
        description: 'Ergonomic, adjustable height & lumbar support.',
        longDesc: 'Brand: Staples | Condition: Good | Description: Ergonomic office chair with adjustable height and lumbar support. Comfortable for long study sessions. Minor wear on armrests.',
        price: '$55',
        priceValue: 55,
        image: 'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 5,
        name: 'Mini Fridge',
        brand: 'Ikea',
        condition: 'Fair',
        description: 'Compact, energy efficient, perfect for dorms.',
        longDesc: 'Brand: Ikea | Condition: Fair | Description: Compact fridge, perfect for dorm rooms. Energy efficient, keeps food and drinks cold. Some visible scratches but works perfectly.',
        price: '$70',
        priceValue: 70,
        image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 6,
        name: 'Bed Frame & Mattress',
        brand: 'Casper',
        condition: 'Good',
        description: 'Queen size, sturdy frame, clean mattress included.',
        longDesc: 'Brand: Casper | Condition: Good | Description: Queen bed frame with clean mattress. Sturdy and easy to assemble. Mattress has always had a cover, no stains.',
        price: '$110',
        priceValue: 110,
        image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80'
    }
];

// --- Wishlist storage (local for session) ---
let wishlist = [];

// --- Current search query and filter ---
let currentSearch = "";
let currentSort = "default"; // "default", "lowhigh", "highlow"
let currentCondition = "All";

// --- SPA navigation ---
function showPage(pageId) {
    document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');

    document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));
    if (pageId === 'home') {
        document.querySelector('nav ul li a[href="index.html"]').classList.add('active');
    } else {
        document.querySelector(`nav ul li a[href="#${pageId}"]`).classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'items') {
        renderProducts();
        setupSearchBar();
        setupFilterButtons();
    }
    if (pageId === 'wishlist') renderWishlist();
    if (pageId === 'inquiry') populateBuyDropdown();
}

// --- Render products for sale (with search and filter) ---
function renderProducts() {
    const grid = document.getElementById('productGrid');
    const noItemsDiv = document.getElementById('noItemsFound');
    grid.innerHTML = '';
    let filtered = products.filter((p) => {
        let match = true;
        if (currentSearch.trim()) {
            const q = currentSearch.trim().toLowerCase();
            match =
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q);
        }
        if (currentCondition !== "All") {
            match = match && p.condition === currentCondition;
        }
        return match;
    });
    // Sorting
    if (currentSort === "lowhigh") {
        filtered = filtered.slice().sort((a, b) => a.priceValue - b.priceValue);
    } else if (currentSort === "highlow") {
        filtered = filtered.slice().sort((a, b) => b.priceValue - a.priceValue);
    }

    if (filtered.length === 0) {
        noItemsDiv.classList.remove('hidden');
        return;
    } else {
        noItemsDiv.classList.add('hidden');
    }
    filtered.forEach(product => {
        const inWishlist = wishlist.some(item => item.id === product.id);
        grid.innerHTML += `
            <div class="item-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <div class="item-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <span class="price">${product.price}</span>
                    <button ${inWishlist ? 'disabled' : ''} class="wishlist-btn" data-id="${product.id}">
                        ${inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                    </button>
                    <button class="view-details-btn" data-id="${product.id}">View Details</button>
                    <span class="wish-confirm" id="wish-confirm-${product.id}"></span>
                </div>
            </div>
        `;
    });
    setupCardEvents(filtered);
}

// --- Setup Search Bar events ---
function setupSearchBar() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    if (!searchInput || !searchBtn) return;

    searchInput.oninput = null;
    searchBtn.onclick = null;

    searchInput.value = currentSearch;
    searchInput.oninput = (e) => {
        currentSearch = e.target.value;
        renderProducts();
    };
    searchBtn.onclick = () => {
        currentSearch = searchInput.value;
        renderProducts();
        searchInput.focus();
    };
}

// --- Setup filter button events ---
function setupFilterButtons() {
    document.getElementById('sortLowHigh').onclick = () => {
        currentSort = "lowhigh";
        renderProducts();
    };
    document.getElementById('sortHighLow').onclick = () => {
        currentSort = "highlow";
        renderProducts();
    };
    document.querySelectorAll('.filter-btn[data-condition]').forEach(btn => {
        btn.onclick = () => {
            currentCondition = btn.getAttribute('data-condition');
            document.querySelectorAll('.filter-btn[data-condition]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts();
        };
    });
}

// --- Setup item card click events ---
function setupCardEvents(filteredProducts) {
    document.querySelectorAll('.item-card').forEach(card => {
        card.onclick = (e) => {
            if (
                e.target.classList.contains('wishlist-btn') ||
                e.target.classList.contains('view-details-btn')
            ) return;
            const id = parseInt(card.getAttribute('data-id'), 10);
            openProductModal(id);
        };
    });
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.onclick = (e) => {
            const id = parseInt(btn.getAttribute('data-id'), 10);
            openProductModal(id);
            e.stopPropagation();
        };
    });
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.onclick = (e) => {
            const id = parseInt(btn.getAttribute('data-id'), 10);
            addToWishlist(id);
            e.stopPropagation();
        };
    });
}

// --- Wishlist logic ---
function addToWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (!wishlist.some(item => item.id === productId)) {
        wishlist.push(product);
        const confirmSpan = document.getElementById(`wish-confirm-${productId}`);
        if (confirmSpan) {
            confirmSpan.textContent = `Added "${product.name}" to wishlist!`;
            setTimeout(() => {
                confirmSpan.textContent = '';
                renderProducts();
            }, 1800);
        } else {
            renderProducts();
        }
    }
    if (isModalOpen && modalProductId === productId) {
        updateModalWishlistBtn();
    }
}

// --- Render Wishlist page ---
function renderWishlist() {
    const grid = document.getElementById('wishlistGrid');
    const emptyMsg = document.getElementById('emptyWishlist');
    grid.innerHTML = '';
    if (wishlist.length === 0) {
        emptyMsg.classList.remove('hidden');
        grid.classList.add('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        grid.classList.remove('hidden');
        wishlist.forEach(item => {
            grid.innerHTML += `
                <div class="wishlist-card">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="wishlist-info">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <span class="price">${item.price}</span>
                        <button onclick="removeFromWishlist(${item.id})">Remove from Wishlist</button>
                    </div>
                </div>
            `;
        });
    }
}

// --- Remove item from wishlist ---
function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    renderWishlist();
    renderProducts();
    if (isModalOpen && modalProductId === productId) {
        updateModalWishlistBtn();
    }
}

// --- Inquiry form logic ---
function toggleInquiryFields() {
    const action = document.getElementById('actionSelect').value;
    document.getElementById('buyField').classList.toggle('hidden', action !== 'buy');
    document.getElementById('sellField').classList.toggle('hidden', action !== 'sell');
}

// --- Inquiry dropdown population ---
function populateBuyDropdown() {
    const dropdown = document.getElementById('buyItemDropdown');
    dropdown.innerHTML = `<option value="">Select item</option>`;
    products.forEach(product => {
        dropdown.innerHTML += `<option value="${product.name}">${product.name}</option>`;
    });
}

// --- Form submission ---
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    if (['items', 'inquiry', 'wishlist'].includes(hash)) {
        showPage(hash);
    } else {
        showPage('home');
    }

    const inquiryForm = document.getElementById('inquiryForm');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', function (e) {
            e.preventDefault();
            inquiryForm.style.display = 'none';
            const conf = document.getElementById('confirmationMessage');
            conf.classList.remove('hidden');
            conf.textContent = "Thank you for your inquiry! We'll get back to you soon.";
            setTimeout(() => {
                inquiryForm.reset();
                inquiryForm.style.display = 'flex';
                conf.classList.add('hidden');
            }, 3500);
        });
    }
});

// --- Modal Logic ---
let isModalOpen = false;
let modalProductId = null;

function openProductModal(productId) {
    const modal = document.getElementById('productModal');
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('modalProductImg').src = product.image;
    document.getElementById('modalProductImg').alt = product.name;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductBrand').textContent = `Brand: ${product.brand}`;
    document.getElementById('modalProductCondition').textContent = `Condition: ${product.condition}`;
    document.getElementById('modalProductPrice').textContent = product.price;
    document.getElementById('modalProductDesc').textContent = product.longDesc;

    updateModalWishlistBtn(productId);

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    isModalOpen = true;
    modalProductId = productId;
}

function updateModalWishlistBtn(productId) {
    if (typeof productId === 'undefined') productId = modalProductId;
    const btn = document.getElementById('modalWishlistBtn');
    const inWishlist = wishlist.some(item => item.id === productId);
    btn.textContent = inWishlist ? 'In Wishlist' : 'Add to Wishlist';
    btn.disabled = inWishlist;
    btn.onclick = () => addToWishlist(productId);
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    document.body.style.overflow = '';
    isModalOpen = false;
    modalProductId = null;
}

document.getElementById('modalCloseBtn').onclick = closeProductModal;
document.getElementById('productModal').onclick = function (e) {
    if (e.target === this) {
        closeProductModal();
    }
};
document.addEventListener('keydown', function (e) {
    if (isModalOpen && (e.key === "Escape" || e.key === "Esc")) {
        closeProductModal();
    }
});
