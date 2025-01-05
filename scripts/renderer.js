document.addEventListener('DOMContentLoaded', () => {
    const path = require('path');
    const fs = require('fs');
    const baseDir = __dirname;

    // Function to get image path with fallback
    function getImagePath(baseName) {
        const jpgPath = path.join(baseDir, '..', 'assets', `${baseName}.jpg`).replace(/\\/g, '/');
        const pngPath = path.join(baseDir, '..', 'assets', `${baseName}.png`).replace(/\\/g, '/');
        
        try {
            if (fs.existsSync(jpgPath)) return jpgPath;
            if (fs.existsSync(pngPath)) return pngPath;
            return null;
        } catch(err) {
            return null;
        }
    }

    // Sample product data
    const products = [
        {
            id: 1,
            name: 'Berry Mojito',
            price: 120.00,
            image: getImagePath('mojito'),
            category: 'Beverages'
        },
        {
            id: 2,
            name: 'Chicken Pasta',
            price: 180.00,
            image: getImagePath('pasta'),
            category: 'Main Course'
        },
        {
            id: 3,
            name: 'Cheeseburger',
            price: 150.00,
            image: getImagePath('burger'),
            category: 'Fast Food'
        },
        {
            id: 4,
            name: 'Hot Coffee',
            price: 80.00,
            image: getImagePath('coffee'),
            category: 'Beverages'
        }
    ];

    const cart = {
        items: [],
        discount: 0,
        discountType: 'percentage',
        tax: 0.18 // 18% tax
    };

    // DOM Elements
    const productsGrid = document.querySelector('.products-grid');
    const cartItems = document.querySelector('.cart-items');
    const itemsCount = document.getElementById('items-count');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const discountInput = document.getElementById('discount');
    const discountType = document.getElementById('discount-type');
    const searchInput = document.querySelector('.search-bar input');
    const categoryButtons = document.querySelectorAll('.category-tabs button');

    // Create product card with image fallback
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="file:///${product.image || ''}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'><rect width=\\'200\\' height=\\'200\\' fill=\\'%23f0f0f0\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%23999\\' font-family=\\'Arial\\' font-size=\\'16\\'>${product.name}</text></svg>';">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">₹${product.price.toFixed(2)}</div>
            </div>
        `;
        card.addEventListener('click', () => addToCart(product));
        return card;
    }

    // Initialize products grid
    function initializeProducts(filteredProducts = products) {
        productsGrid.innerHTML = '';
        filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    }

    // Add to cart
    function addToCart(product) {
        const existingItem = cart.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        updateCart();
    }

    // Update cart display
    function updateCart() {
        cartItems.innerHTML = '';
        cart.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn minus">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus">+</button>
                </div>
                <button class="remove-btn">×</button>
            `;

            const minusBtn = itemElement.querySelector('.minus');
            const plusBtn = itemElement.querySelector('.plus');
            const removeBtn = itemElement.querySelector('.remove-btn');

            minusBtn.addEventListener('click', () => updateQuantity(item.id, item.quantity - 1));
            plusBtn.addEventListener('click', () => updateQuantity(item.id, item.quantity + 1));
            removeBtn.addEventListener('click', () => removeItem(item.id));

            cartItems.appendChild(itemElement);
        });

        updateTotals();
    }

    // Update quantity
    function updateQuantity(itemId, newQuantity) {
        if (newQuantity < 1) {
            removeItem(itemId);
            return;
        }
        const item = cart.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = newQuantity;
            updateCart();
        }
    }

    // Remove item
    function removeItem(itemId) {
        cart.items = cart.items.filter(item => item.id !== itemId);
        updateCart();
    }

    // Update totals
    function updateTotals() {
        const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const discount = calculateDiscount(subtotal);
        const discountedSubtotal = subtotal - discount;
        const tax = discountedSubtotal * cart.tax;
        const total = discountedSubtotal + tax;

        itemsCount.textContent = cart.items.reduce((total, item) => total + item.quantity, 0);
        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        taxElement.textContent = `₹${tax.toFixed(2)}`;
        totalElement.textContent = `₹${total.toFixed(2)}`;
    }

    // Calculate discount
    function calculateDiscount(subtotal) {
        const discountValue = parseFloat(discountInput.value) || 0;
        if (cart.discountType === 'percentage') {
            return subtotal * (discountValue / 100);
        }
        return discountValue;
    }

    // Search products
    function searchProducts(query) {
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase())
        );
        initializeProducts(filtered);
    }

    // Filter by category
    function filterByCategory(category) {
        const filtered = category === 'All' 
            ? products 
            : products.filter(product => product.category === category);
        initializeProducts(filtered);
    }

    // Event Listeners
    discountInput.addEventListener('input', updateTotals);
    discountType.addEventListener('change', (e) => {
        cart.discountType = e.target.value;
        updateTotals();
    });

    searchInput.addEventListener('input', (e) => searchProducts(e.target.value));

    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            filterByCategory(e.target.textContent);
        });
    });

    // Action buttons
    document.querySelector('.pay-btn').addEventListener('click', () => {
        if (cart.items.length === 0) {
            alert('Please add items to cart before proceeding to payment');
            return;
        }
        console.log('Processing payment...', cart);
    });

    document.querySelector('.hold-btn').addEventListener('click', () => {
        if (cart.items.length === 0) {
            alert('No items to hold');
            return;
        }
        console.log('Order placed on hold', cart);
    });

    document.querySelector('.cancel-btn').addEventListener('click', () => {
        if (cart.items.length === 0) {
            alert('No items to cancel');
            return;
        }
        if (confirm('Are you sure you want to cancel this order?')) {
            cart.items = [];
            updateCart();
        }
    });

    // Initialize products
    initializeProducts();
});
